import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    tags: [{ type: String }],
    statement: { type: String, required: true },
    examples: [{ input: String, output: String }],
    constraints: [String],
    solution: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isPublished: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Problem = mongoose.model('Problem', problemSchema);
export default Problem;
