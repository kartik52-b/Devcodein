import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    externalId: { type: String, index: true },
    language: { type: String, required: true },
    code: { type: String, required: true },
    result: { type: String, enum: ['accepted', 'wrong-answer', 'runtime-error', 'compile-error'], default: 'accepted' },
    judgedBy: { type: String, default: 'static-analysis' },
    messages: [{ type: String }],
    runtime: { type: Number, default: 0 },
    memory: { type: Number, default: 0 }
  },
  { timestamps: true }
);

submissionSchema.index({ user: 1, problem: 1 });

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
