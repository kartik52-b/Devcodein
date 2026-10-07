import mongoose from 'mongoose';

/**
 * MongoDB connection strategy.
 *
 * - If MONGODB_URI is set we try to use it first (Atlas / local mongod).
 * - When no URI is configured, or the configured URI is unreachable, we fall
 *   back to an ephemeral in-memory MongoDB (mongodb-memory-server) so the
 *   application can still run end-to-end in development.
 * - In production the fallback is disabled: a missing database must fail loudly
 *   instead of silently serving data from a throwaway process.
 *
 * The connection always resolves within a few seconds so the HTTP server can
 * start immediately and report database status through /health.
 */

let memoryServer = null;
let lastMode = 'disconnected';

const FALLBACK_DISABLED =
  process.env.NODE_ENV === 'production' ||
  process.env.MONGO_MEMORY_FALLBACK === 'false';

const PRIMARY_TIMEOUT_MS = Number(process.env.MONGO_CONNECT_TIMEOUT_MS) || 5000;

const log = (message) => console.log(`[db] ${message}`);
const warn = (message) => console.warn(`[db] ${message}`);

const connectTo = async (uri, label) => {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: PRIMARY_TIMEOUT_MS,
    connectTimeoutMS: PRIMARY_TIMEOUT_MS
  });
  lastMode = label;
  log(`connected (${label})`);
};

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      await connectTo(uri, 'configured');
      return { mode: 'configured', uri };
    } catch (error) {
      warn(`configured MONGODB_URI is unreachable: ${error.message}`);
      if (FALLBACK_DISABLED) {
        lastMode = 'unavailable';
        throw error;
      }
    }
  } else {
    warn('MONGODB_URI is not set');
    if (FALLBACK_DISABLED) {
      lastMode = 'unavailable';
      throw new Error('MONGODB_URI is required when the in-memory fallback is disabled');
    }
  }

  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const memoryUri = memoryServer.getUri();
    await connectTo(memoryUri, 'in-memory');
    warn('using an ephemeral in-memory MongoDB (development only)');
    return { mode: 'in-memory', uri: memoryUri };
  } catch (error) {
    lastMode = 'unavailable';
    warn(`in-memory fallback unavailable: ${error.message}`);
    throw error;
  }
};

/** True while the primary mongoose connection is open. */
export const isDbReady = () => mongoose.connection.readyState === 1;

export const getDbMode = () => lastMode;

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
  lastMode = 'disconnected';
};

/**
 * Express handler used by routes that cannot work without a database, so the
 * client gets a clean 503 instead of a mongoose buffering timeout.
 */
export const requireDb = (req, res, next) => {
  if (!isDbReady()) {
    return res.status(503).json({
      message: 'Database is unavailable right now. Please try again shortly.'
    });
  }
  next();
};
