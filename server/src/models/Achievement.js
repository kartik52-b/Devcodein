import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    xpReward: { type: Number, default: 0 },
    icon: { type: String, default: '🏅' }
  },
  { timestamps: true }
);

const Achievement = mongoose.model('Achievement', achievementSchema);
export default Achievement;
