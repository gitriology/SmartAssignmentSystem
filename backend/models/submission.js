const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment",
    required: true
  },

  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  attachments: [
    {
      filename: String,
      url: String,
      mimetype: String,
      size: Number
    }
  ],

  marks: {
    total: { type: Number, default: 0 },
    perCriteria: [
      {
        criteria: String,
        marks: Number
      }
    ]
  },

  feedback: {
    type: String,
    default: ""
  },

  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  gradedAt: Date,

  submittedAt: {
    type: Date,
    default: Date.now
  },

  resubmittedAt: Date,

  status: {
    type: String,
    enum: ["submitted", "graded", "resubmitted"],
    default: "submitted"
  },

  isLate: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("Submission", SubmissionSchema);
