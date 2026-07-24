import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    language: { type: String, required: true },
    code: { type: String, required: true },
    result: { type: String, enum: ['accepted', 'wrong-answer', 'runtime-error', 'compile-error'], default: 'accepted' },
    runtime: { type: Number, default: 0 },
    memory: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
