import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const OTP_TTL_MINUTES = 10;

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Google-only accounts have no password; local accounts always do.
    password: {
        type: String,
        required: function() { return this.provider !== 'google'; },
        minlength: 6,
        select: false
    },

    // --- sign-in provider (local email/password vs Google OAuth) ---
    // `providerId` is the stable Google subject id; matching accounts by
    // verified email prevents duplicate users when the same person switches
    // between password and Google sign-in.
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    providerId: { type: String, select: false },

    // Welcome email is sent once, at account creation, and recorded here so
    // no later login can ever trigger a second copy (server-authoritative).
    welcomeEmailSent: { type: Boolean, default: false },

    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    xp: { type: Number, default: 0 },
    solvedProblems: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    avatar: { type: String, default: '' },
    badges: [{ type: String }],
    isActive: { type: Boolean, default: true },

    // --- email verification (OTP) ---
    isEmailVerified: { type: Boolean, default: false },
    otpHash: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },

    // --- server-authoritative gamification ---
    // Challenges already solved (external catalog ids) — used to prevent
    // duplicate XP rewards on repeated submissions.
    solvedProblemIds: [{ type: String }],
    achievements: [
        {
            _id: false,
            key: { type: String, required: true },
            title: String,
            desc: String,
            icon: String,
            earned: String
        }
    ],
    // Mission reward claims, keyed per day / per week so each reward can only
    // be collected once. See routes/profileRoutes.js.
    // NOTE: the sub-document must not use a property literally named `type` —
    // Mongoose would read it as a type declaration and drop the array.
    missionClaims: [
        {
            _id: false,
            key: { type: String, required: true },
            missionId: Number,
            claimType: String,
            xp: Number,
            claimedAt: Date
        }
    ]
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    // Google-only accounts cannot sign in with a password at all.
    if (!this.password) return false;
    return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.setPassword = function(plain) {
    this.password = plain;
};

userSchema.methods.generateOtp = function() {
    const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    this.otpHash = crypto.createHash('sha256').update(code).digest('hex');
    this.otpExpires = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
    this.otpAttempts = 0;
    return code;
};

userSchema.methods.verifyOtp = function(code) {
    if (!this.otpHash || !this.otpExpires) return false;
    if (this.otpExpires.getTime() < Date.now()) return false;
    if (this.otpAttempts >= 5) return false;
    const candidate = crypto.createHash('sha256').update(String(code)).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(this.otpHash));
};

userSchema.statics.OTP_TTL_MINUTES = OTP_TTL_MINUTES;

const User = mongoose.model('User', userSchema);
export default User;
