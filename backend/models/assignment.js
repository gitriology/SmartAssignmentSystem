const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema({
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    default: ""
  },

  subject: {
    type: String,
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

  dueDate: {
    type: Date,
    required: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  rubric: [
    {
      criteria: { type: String },
      marks: { type: Number, default: 0 }
    }
  ],

  status: {
    type: String,
    enum: ["draft", "active", "closed"],
    default: "active"
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: Date
});

module.exports = mongoose.model("Assignment", AssignmentSchema);
