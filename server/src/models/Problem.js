import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema(
  {
    // Stable id shared with the frontend catalog (src/data/challengesData.js).
    externalId: { type: String, index: true, unique: true, sparse: true },
    title: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    tags: [{ type: String }],
    statement: { type: String, required: true },
    examples: [{ input: String, output: String }],
    constraints: [String],
    solution: { type: String, default: '' },
    starterCode: { type: String, default: '' },
    functionName: { type: String, default: '' },
    hints: [{ type: String }],
    discussion: [{ author: String, message: String, time: String }],
    testCases: [
      {
        label: String,
        args: { type: mongoose.Schema.Types.Mixed, default: [] },
        expected: { type: mongoose.Schema.Types.Mixed }
      }
    ],
    xpReward: { type: Number, default: 100, min: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isPublished: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Problem = mongoose.model('Problem', problemSchema);
export default Problem;
