// backend/models/CodingSubmission.js
const mongoose = require("mongoose");

const CodingSubmissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: "CodingProblem", required: true },
  language: { type: String, required: true },
  code: { type: String, required: true },
  passed: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  details: { type: Array, default: [] }, // per testcase result
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CodingSubmission", CodingSubmissionSchema);
