export const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Log the full error for operators, but never hand stack traces to clients.
  console.error(`[${req.method} ${req.originalUrl}]`, err);

  const payload = { message: err.message || 'Server error' };
  if (err.code === 11000) {
    payload.message = 'That record already exists';
  }
  res.status(statusCode).json(payload);
};
