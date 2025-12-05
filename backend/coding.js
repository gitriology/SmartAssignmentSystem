// backend/routes/coding.js
const express = require("express");
const router = express.Router();
const CodingProblem = require("./models/CodingProblem");
const CodingSubmission = require("./models/CodingSubmission");
const { runCode } = require("./judge0");
const requireAuth = require("./middleware");
const mongoose = require("mongoose");

// Map friendly language names to Judge0 language_id (example; adjust ids for your instance)
const LANGUAGE_MAP = {
  "python": 71,    // Python (3.8) example id — check Judge0 mapping
  "javascript": 63,
  "cpp": 54,
  "c": 50,
  "java": 62
};

router.get("/judge0/test", async (req, res) => {
  try {
    const { runCode } = require("./judge0");

    const out = await runCode({
      source_code: "print(1+2)",
      language_id: 71, // Python
      stdin: ""
    });

    res.json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Create problem (Teacher only)
router.post("/problems", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "Teacher") return res.status(403).json({ message: "Only teachers can create problems" });

    const { title, description, starterCode = {}, testCases = [] } = req.body;
    const problem = new CodingProblem({
      title,
      description,
      starterCode,
      testCases,
      createdBy: req.user.id
    });
    await problem.save();
    res.status(201).json(problem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// List problems (open to all authenticated)
router.get("/problems", requireAuth, async (req, res) => {
  try {
    const problems = await CodingProblem.find().sort({ createdAt: -1 });
    res.json(problems);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/submission/:id", requireAuth, async (req, res) => {
  try {
    const sub = await CodingSubmission.findById(req.params.id)
      .populate("student", "name email")
      .populate("problem", "title description");

    if (!sub) return res.status(404).json({ message: "Submission not found" });

    res.json(sub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Get problem by id
router.get("/problem/:id", requireAuth, async (req, res) => {
  try {
    const problem = await CodingProblem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: "Problem not found" });
    res.json(problem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Run single test (fast feedback) — no saving
router.post("/run", requireAuth, async (req, res) => {
  try {
    const { code, language, stdin } = req.body;
    const language_id = LANGUAGE_MAP[language];
    if (!language_id) return res.status(400).json({ message: "Unsupported language" });

    const out = await runCode({ source_code: code, language_id, stdin });
    res.json(out);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit code to be evaluated against all testcases and saved
// Submit code to be evaluated against all testcases
router.post("/problems/:id/submit", requireAuth, async (req, res) => {
  try {
    const { code, language } = req.body;
    const problem = await CodingProblem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    const language_id = LANGUAGE_MAP[language];
    if (!language_id) return res.status(400).json({ message: "Unsupported language" });

    const details = [];
    let passed = 0;

    // Run against all testcases
    for (const tc of problem.testCases) {
      const out = await runCode({
        source_code: code,
        language_id,
        stdin: tc.input
      });

      const stdout = (out.stdout || "").toString().trim();
      const expected = tc.output.toString().trim();
      const ok = stdout === expected;
      if (ok) passed++;

      details.push({
        input: tc.input,
        expected,
        stdout,
        ok,
        raw: out
      });
    }

    // ==========================================================
    // TEACHER MODE → return results WITHOUT saving
    // ==========================================================
    if (req.user.role === "Teacher") {
      return res.json({
        mode: "teacher-preview",
        passed,
        total: problem.testCases.length,
        details
      });
    }

    // ==========================================================
    // STUDENT MODE → Save to DB
    // ==========================================================
    const submission = new CodingSubmission({
      student: req.user.id,
      problem: problem._id,
      language,
      code,
      passed,
      total: problem.testCases.length,
      details
    });

    await submission.save();

    res.status(201).json({
      mode: "student-submit",
      message: "Submitted",
      passed,
      total: problem.testCases.length,
      submission
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a problem (Teacher only)
router.delete("/problems/:id", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "Teacher") {
      return res.status(403).json({ message: "Only teachers can delete problems" });
    }

    const deleted = await CodingProblem.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Problem not found" });

    res.json({ message: "Problem deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// List submissions for a problem (teacher)
router.get("/problems/:id/submissions", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "Teacher") return res.status(403).json({ message: "Teachers only" });
    const subs = await CodingSubmission.find({ problem: req.params.id }).populate("student", "name email");
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Student: list my submissions
router.get("/my/submissions", requireAuth, async (req, res) => {
  try {
    const subs = await CodingSubmission.find({ student: req.user.id }).populate("problem", "title");
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/all/submissions", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "Teacher") {
      return res.status(403).json({ message: "Teachers only" });
    }

    const subs = await CodingSubmission.find()
      .populate("student", "name email")
      .populate("problem", "title");

    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
