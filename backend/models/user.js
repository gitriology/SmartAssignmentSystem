const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["Student", "Teacher"],
    required: true
  },

  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: function () {
      return this.role === "Student" || this.role === "Teacher";
    }
  },

  subject: {
    type: String,
    required: function () {
      return this.role === "Teacher";
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", UserSchema);
