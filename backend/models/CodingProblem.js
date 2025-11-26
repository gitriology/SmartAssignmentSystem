// backend/models/CodingProblem.js
const mongoose = require("mongoose");

const TestCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true }
});

const CodingProblemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  starterCode: { type: Map, of: String, default: {} }, // language -> code
  testCases: [TestCaseSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CodingProblem", CodingProblemSchema);
