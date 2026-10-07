import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    key: { type: String, index: true, unique: true, sparse: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    xpReward: { type: Number, default: 0 },
    icon: { type: String, default: '🏅' }
  },
  { timestamps: true }
);

achievementSchema.pre('validate', function (next) {
  if (!this.key) {
    this.key = String(this.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Achievement = mongoose.model('Achievement', achievementSchema);
export default Achievement;
