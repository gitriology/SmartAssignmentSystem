require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt=require("jsonwebtoken");
const multer = require("multer");
const path=require("path");
const cors = require("cors");

const User = require("./models/user");
const Assignment = require("./models/assignment");
const Submission = require("./models/submission");
const Section = require("./models/section");
const requireAuth = require("./middleware");

const sendEmail = require("./mailer");
const codingRoutes = require("./coding");

const app = express();
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(
  cors({
    origin: ["http://localhost:5173","https://smart-assignment-system-lyart.vercel.app/"],
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

async function main(){
    await mongoose.connect(process.env.MONGO_URL);
}
main().then(()=>{
    console.log("Connection established successfully!");
}).catch((error)=>{
    console.log(error);
});

app.listen(process.env.PORT,()=>{
    console.log(`Listening to port ${process.env.PORT}`);
})

function makeFileUrl(req, relPath) {
  return `${req.protocol}://${req.get("host")}${relPath}`;
}

//coding routes
app.use("/coding", codingRoutes);

//Authentication Routes
const saltRounds=10;
app.post("/auth/register",async (req,res)=>{
    try{
        const {name,email,password,role, subject, section} = req.body;
        if (!name || !email || !password || !role) {
          return res.status(400).json({ message: "All fields are required" });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(409).json({ message: "Email already registered" });
        }
        const sectionDoc = await Section.findById(section);
        if (!sectionDoc) {
          return res.status(400).json({ message: "Invalid section selected" });
        }
        let hashedPassword=await bcrypt.hash(password,saltRounds);
        const newUser = new User({name:name,email:email,password:hashedPassword,role:role, subject:subject, section:section});
        await newUser.save();
        if (role === "Teacher") {
          if (!sectionDoc.teachers.includes(newUser._id)) {
            sectionDoc.teachers.push(newUser._id);
          }
        } else {
          if (!sectionDoc.students.includes(newUser._id)) {
            sectionDoc.students.push(newUser._id);
          }
        }
        await sectionDoc.save();
        let token=jwt.sign({
            id:newUser._id,
            name:newUser.name,
            email:newUser.email,
            role:newUser.role,
            subject:newUser.subject,
            section:sectionDoc._id,
            sectionName:sectionDoc.name
        },process.env.JWT_SECRET,{expiresIn:'2h'});
        res.status(201).json({message:"Saved to DB successfully!",token: token});
    }catch(err){
        res.status(400).json({message: `Error Occured: ${err}`})
    }    
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const sectionDoc = await Section.findById(foundUser.section);
    if (!sectionDoc) {
      return res.status(400).json({
        message: "Your assigned section no longer exists. Contact admin."
      });
    }
    const token = jwt.sign(
      {
        id: foundUser._id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        subject: foundUser.subject,
        section: sectionDoc._id,
        sectionName:sectionDoc.name
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );
    res.status(200).json({ token });
  } catch (err) {
    res.status(400).json({ message: `Error Occurred: ${err.message}` });
  }
});

//User Routes
app.get("/users/:id", requireAuth, async (req,res)=>{
    try{
        const id=req.params.id;
        const foundUser = await User.findById(id).populate("section", "name");
        if(req.user.id !== id){
          return res.status(403).json({ message: "You do not have access!" });
        }
        if(!foundUser){
            return res.status(404).json({message: "User not found!"});
        }else{
            return res.status(200).json({name: foundUser.name, email: foundUser.email, section: foundUser.section.name});
        }
    }catch(err){
        console.log(err);
         res.status(400).json({message: `Error Occured: ${err}`});
    }
});

app.put("/users/:id",requireAuth,async (req,res)=>{
    try{
        const id=req.params.id;
        const user = await User.findById(id);
        if (req.user.id !== id) {
          return res.status(403).json({ message: "You cannot edit another user" });
        }
        if(!user){
            res.status(404).json({message: "User not found!"});
        }
        const {name,email,password} = req.body;
        if(name) user.name=name;
        if(email) user.email=email;
        if(password){
            const newHashedPassword = await bcrypt.hash(password,saltRounds);
            user.password=newHashedPassword;
        }
        await user.save();
        res.status(200).json({message: "Saved changes successfully!", user:{
            name:user.name,
            email:user.email
        }});
    }catch(err){
        res.status(400).json({message: `Error Occured: ${err}`});
    }
});

app.get("/sections", async (req, res) => {
  try {
    const sections = await Section.find().select("name");
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: "Error fetching sections" });
  }
});

//Assignment routes
const storageAssignment = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/assignments/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg"
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF or image files are allowed!"), false);
  }
};
const uploadAssignments = multer({
  storage: storageAssignment,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } 
});
app.post("/assignments/create", uploadAssignments.array("attachments", 5), requireAuth, async (req, res) => {
  try {
    if(req.user.role=='Teacher'){
        const { title, description, dueDate, rubric, status, subject } = req.body;
        const attachments = req.files?.map(file => {
        const relPath = `/uploads/assignments/${file.filename}`;
        return {
          filename: file.filename,
          url: relPath, // stored path
          fullUrl: makeFileUrl(req, relPath), // complete URL for frontend
          mimetype: file.mimetype,
          size: file.size
        };
      }) || [];
        let parsedRubric = [];
        if (rubric) {
          try {
            parsedRubric = typeof rubric === "string" ? JSON.parse(rubric) : rubric;
            parsedRubric = parsedRubric.map(r => ({
              criteria: r.criteria,
              marks: Number(r.marks) || 0, 
            }));
          } catch (err) {
            console.log("Rubric parse error:", err);
          }
        }
        const newAssignment = new Assignment({
        title,
        description,
        dueDate,
        createdBy:req.user.id,
        section: req.user.section,
        attachments,
        subject: subject || req.user.subject,
        rubric: parsedRubric,
        status: status || "active", 
        createdAt: Date.now(),
        updatedAt: Date.now()
        });

        const savedAssignment=await newAssignment.save();
        if (savedAssignment) {
        const sectionStudents = await User.find({ 
          section: req.user.section, 
          role: "Student" 
        });

        const emails = sectionStudents.map(s => s.email);

        if (emails.length > 0) {
          const html = `
            <h3>New Assignment Posted: ${savedAssignment.title}</h3>
            <p>${savedAssignment.description || ""}</p>
            <p>Due Date: ${new Date(savedAssignment.dueDate).toLocaleString()}</p>
            <p>Please check your dashboard to submit.</p>
          `;
          sendEmail(emails.join(","), "New Assignment Posted", html);
        }
      }
        res.status(201).json({
        message: "Assignment created successfully!",
        data: savedAssignment
        });
    }else{
        res.status(403).json({ message: "Invalid role" });
    }
  } catch (err) {
    res.status(400).json({ message: `Error Occurred: ${err.message}` });
  }
});

app.get("/assignments/all", requireAuth, async (req,res)=>{
    try{
        if(req.user.role=='Teacher'){
        const assignments = await Assignment.find({ createdBy: req.user.id,section: req.user.section });
        res.json(assignments);
        }else if(req.user.role=='Student'){
            const assignments = await Assignment.find({ status: "active",section: req.user.section });
            res.json(assignments);
        }else{
            res.status(403).json({ message: "Invalid role" });
        }
    }catch(err){
        res.status(400).json({ message: `Error Occurred: ${err.message}` });
    }
});

app.get("/assignments/:id", requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    let canEdit = false; 
    if (req.user.role === "Student") {
      if (
        assignment.status !== "active" ||
        assignment.section.toString() !== req.user.section.toString()
      ) {
        return res.status(403).json({ message: "This assignment is not available" });
      }
      return res.status(200).json({
        ...assignment.toObject(),
        canEdit: false
      });
    }
    if (req.user.role === "Teacher") {
      if (assignment.subject !== req.user.subject) {
        return res.status(403).json({ message: "Different subject. Access denied." });
      }
      const isCreator = assignment.createdBy.toString() === req.user.id;
      const sameSection = assignment.section.toString() === req.user.section.toString();
      if (isCreator && sameSection) {
        canEdit = true;
      }
      return res.status(200).json({
        ...assignment.toObject(),
        canEdit: canEdit
      });
    }
    return res.status(403).json({ message: "Invalid user role" });

  } catch (err) {
    res.status(400).json({ message: `Error Occurred: ${err.message}` });
  }
});

app.put("/assignments/edit/:id", uploadAssignments.array("attachments", 5), requireAuth,async (req,res)=>{
  try {
    if(req.user.role=='Teacher'){
        const assignment= await Assignment.findById(req.params.id);
        if (!assignment) {
          return res.status(404).json({ message: "Assignment not found." });
        }
        if (assignment.createdBy.toString() !== req.user.id || assignment.section.toString() !== req.user.section.toString() || assignment.subject !== req.user.subject) {
          return res.status(403).json({ message: "You are not authorized to edit this assignment." });
        }
        const { title, description, dueDate, rubric, status } = req.body;
        let attachments = assignment.attachments; // keep existing
      if (req.files && req.files.length > 0) {
        attachments = req.files.map(file => ({
          filename: file.filename,
          url: `/uploads/assignments/${file.filename}`,
          mimetype: file.mimetype,
          size: file.size,
        }));
      }
        let parsedRubric = assignment.rubric;

      if (rubric) {
        try {
          const incoming = typeof rubric === "string" ? JSON.parse(rubric) : rubric;

          parsedRubric = incoming.map(r => ({
            criteria: r.criteria,
            marks: Number(r.marks),
          }));
        } catch (err) {
          console.log("Rubric parse error:", err);
        }
      }
        assignment.title = title || assignment.title;
        assignment.description = description || assignment.description;
        assignment.dueDate = dueDate || assignment.dueDate;
        assignment.attachments = attachments;
        assignment.rubric = parsedRubric;
        assignment.status = status || assignment.status;
        assignment.updatedAt = Date.now();
        await assignment.save();
        res.status(201).json({
        message: "Assignment updated successfully!",
        data: assignment
        });
    }else{
        res.status(403).json({ message: "Access Denied" });
    }
  } catch (err) {
    res.status(400).json({ message: `Error Occurred: ${err.message}` });
  }
});

app.delete("/assignments/delete/:id", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "Teacher") {
      return res.status(403).json({ message: "Access denied. Only teachers can delete assignments." });
    }
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    if (assignment.createdBy.toString() !== req.user.id || assignment.section.toString() !== req.user.section.toString() || assignment.subject !== req.user.subject) {
      return res.status(403).json({ message: "You are not authorized to delete this assignment." });
    }
    await Submission.deleteMany({ assignment: req.params.id });
    await Assignment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Assignment deleted successfully!" });
  } catch (err) {
    res.status(400).json({ message: `Error occurred: ${err.message}` });
  }
});

//Submissions Routes
const storageSubmissions = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/submissions/"); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const submissionFileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg"
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF or image files are allowed!"), false);
  }
};
const uploadSubmission = multer({
  storage: storageSubmissions,
  fileFilter: submissionFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // Max 10MB per file
});

app.post("/assignments/:id/submissions", uploadSubmission.array("files", 5), requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "Student") {
      return res.status(403).json({ message: "Access denied. Students only." });
    }
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    if (assignment.section.toString() !== req.user.section.toString()) {
        return res.status(403).json({ message: "This assignment does not belong to your section." });
    }
    const isLate = new Date() > new Date(assignment.dueDate);
    const files = req.files.map(file => ({
      filename: file.filename,
      url: `/uploads/submissions/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size
    }));
    const newSubmission = new Submission({
      assignment: assignment._id,
      student: req.user.id,
      attachments:files,
      submittedAt: new Date(),
      status: "submitted",
      isLate: isLate, 
    });
    await newSubmission.save();
    // Get teacher of this assignment
      const teacher = await User.findOne({ 
        _id: assignment.createdBy, 
        role: "Teacher" 
      });

      if (teacher) {
        const html = `
          <h3>New Submission Received</h3>
          <p>Student: ${req.user.name} (${req.user.email})</p>
          <p>Assignment: ${assignment.title}</p>
          <p>Submitted At: ${new Date().toLocaleString()}</p>
        `;
        sendEmail(teacher.email, `New Submission for ${assignment.title}`, html);
      }

    res.status(201).json({
      message: isLate ? "Submitted (Late)" : "Submitted (On Time)",
      data: newSubmission
    });
  } catch (err) {
    res.status(400).json({ message: `Error: ${err.message}` });
  }
});
app.get("/assignments/:id/allSubmissions",requireAuth,async (req,res)=>{
  try{
    if(req.user.role!=="Teacher"){
      return res.status(403).json({ message: "Access denied. Teachers only." });
    }
    const assignmentId=req.params.id;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment)
      return res.status(404).json({ message: "Assignment not found" });
    if (assignment.subject !== req.user.subject || assignment.section.toString() !== req.user.section.toString()
    ) {
      return res.status(403).json({ message: "Not authorized for this assignment." });
    }
    const submissions = await Submission.find({assignment:assignmentId}).populate("assignment").populate("student");
    res.status(200).json(submissions);
  }catch (err) {
    res.status(400).json({ message: `Error: ${err.message}` });
  }
})
app.get("/submissions/my", requireAuth, async (req, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.user.id);
    if(req.user.role!=="Student"){
      return res.status(403).json({ message: "Access denied. Students only." });
    }
    const submissions = await Submission.find({ student: id }).populate("assignment");
    res.status(200).json(submissions);
  } catch (err) {
    res.status(400).json({ message: `Error Occurred: ${err.message}` });
  }
});
app.get("/submissions/:id",requireAuth, async (req,res)=>{
  try{
    const id=req.params.id;
    const submission = await Submission.findById(id).populate("assignment");
    if(!submission){
      return res.status(404).json({ message: "Submission not found." });
    }
    const assignment = submission.assignment;
    if (req.user.role === "Student") {
      if (submission.student._id.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not your submission." });
      }
    }
    if (req.user.role === "Teacher") {
      if (assignment.subject !== req.user.subject || assignment.section.toString() !== req.user.section.toString()) {
        return res.status(403).json({ message: "Not authorized for this submission." });
      }
    }
    res.status(200).json(submission);
  }catch (err) {
    res.status(400).json({ message: `Error Occurred: ${err.message}` });
  }
})
app.put("/submissions/:id/grade", requireAuth,async(req,res)=>{
  try{
      if(req.user.role!=='Teacher'){
      return res.status(403).json({ message: "Access denied. Teachers only." });
    }
    const id = req.params.id;
    const submission = await Submission.findById(req.params.id)
      .populate("assignment");
    if(!submission){
        return res.status(404).json({ message: "Submission not found." });
    }
    const assignment = submission.assignment;
    if (assignment.subject !== req.user.subject || assignment.section.toString() !== req.user.section.toString()) {
      return res.status(403).json({
        message: "Not authorized to grade this submission."
      });
    }
    if (submission.status === "graded") {
      return res.status(400).json({ message: "This submission is already graded." });
    }
    const { marks, feedback } = req.body;
    if (marks) submission.marks = marks;
    if (feedback !== undefined) submission.feedback = feedback;
    submission.gradedBy = req.user.id;
    submission.gradedAt = new Date();
    submission.status = "graded";
    await submission.save();
    // After submission.save()
      const student = await User.findById(submission.student);
      if (student) {
        const action = submission.status === "graded" ? "graded" : "resubmitted";
        const html = `
          <h3>Your submission has been ${action}</h3>
          <p>Assignment: ${submission.assignment.title}</p>
          <p>${submission.status === "graded" ? `Marks: ${submission.marks.total}` : ""}</p>
          <p>${submission.feedback ? `Feedback: ${submission.feedback}` : ""}</p>
        `;
        sendEmail(student.email, `Your submission has been ${action}`, html);
      }

    res.status(200).json({
      message: "Submission graded successfully.",
    submission
    });
  }catch (err) {
    res.status(400).json({ message: `Error Occurred: ${err.message}` });
  }
});
app.put("/submissions/:id/resubmit", requireAuth, uploadSubmission.array("attachments"), async (req, res) => {
  try {
    if (req.user.role !== "Student") {
      return res.status(403).json({ message: "Access denied. Students only." });
    }
    const submission = await Submission.findById(req.params.id).populate("assignment");
    if (!submission) {
      return res.status(404).json({ message: "Submission not found." });
    }
    if (submission.student.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to modify this submission." });
    }
    const assignment = submission.assignment;
    if (assignment.section.toString() !== req.user.section.toString()) {
        return res
          .status(403)
          .json({ message: "You cannot resubmit for another section." });
    }
    if (new Date() > assignment.dueDate) {
      return res.status(400).json({ message: "Deadline has passed. Resubmission not allowed." });
    }    
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map((file) => ({
        filename: file.filename,
        url: `/uploads/submissions/${file.filename}`,
        mimetype: file.mimetype,
        size: file.size,
      }));
      submission.attachments.push(...newAttachments);
    }
    submission.status = "resubmitted";
    submission.resubmittedAt = new Date();
    submission.isLate = false;
    submission.gradedBy = undefined;
    submission.gradedAt = undefined;
    submission.marks = { total: 0, perCriteria: [] };
    submission.feedback = "";
    await submission.save();
    // After submission.save()
    const student = await User.findById(submission.student);
    if (student) {
      const action = submission.status === "graded" ? "graded" : "resubmitted";
      const html = `
        <h3>Your submission has been ${action}</h3>
        <p>Assignment: ${submission.assignment.title}</p>
        <p>${submission.status === "graded" ? `Marks: ${submission.marks.total}` : ""}</p>
        <p>${submission.feedback ? `Feedback: ${submission.feedback}` : ""}</p>
      `;
      sendEmail(student.email, `Your submission has been ${action}`, html);
    }
    res.status(200).json({
      message: "Resubmission successful.",
      submission,
    });
  } catch (err) {
    res.status(400).json({ message: `Error Occurred: ${err.message}` });
  }
});

//dashboard routes
app.get("/teacher/dashboard", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "Teacher") {
      return res.status(403).json({ message: "Access denied. Teachers only." });
    }

    const assignments = await Assignment.find({ createdBy: req.user.id });
    let totalAssignments = assignments.length;
    let totalSubmissions = 0;
    let totalGraded = 0;
    let totalLate = 0;
    let marksSum = 0;
    let gradedCount = 0;

    const topN = 3; // Number of top students per assignment

    const assignmentSummary = await Promise.all(
      assignments.map(async (assignment) => {
        const submissions = await Submission.find({ assignment: assignment._id })
          .populate("student"); // get student details

        const total = submissions.length;
        const gradedSubs = submissions.filter((s) => s.status === "graded");
        const graded = gradedSubs.length;
        const pending = total - graded;
        const late = submissions.filter((s) => s.isLate === true).length;
        const onTime = submissions.filter((s) => s.isLate === false).length;

        const assignmentMarksSum = gradedSubs.reduce(
          (sum, s) => sum + (s.marks?.total || 0),
          0
        );
        const assignmentAvgMarks = graded > 0 ? (assignmentMarksSum / graded).toFixed(2) : 0;

        marksSum += assignmentMarksSum;
        gradedCount += graded;
        totalSubmissions += total;
        totalGraded += graded;
        totalLate += late;

        // Top students sorted by marks
        const topStudents = gradedSubs
          .sort((a, b) => (b.marks?.total || 0) - (a.marks?.total || 0))
          .slice(0, topN)
          .map((s) => ({
            name: s.student.name,
            usn: s.student.usn,
            marks: s.marks.total,
          }));

        const gradeRanges = { "0-50": 0, "51-70": 0, "71-85": 0, "86-100": 0 };
        gradedSubs.forEach((s) => {
          const m = s.marks?.total || 0;
          if (m <= 50) gradeRanges["0-50"]++;
          else if (m <= 70) gradeRanges["51-70"]++;
          else if (m <= 85) gradeRanges["71-85"]++;
          else gradeRanges["86-100"]++;
        });

        return {
          _id: assignment._id,
          title: assignment.title,
          dueDate: assignment.dueDate,
          submissions: total,
          graded,
          pending,
          late,
          onTime,
          averageMarks: assignmentAvgMarks,
          gradeDistribution: gradeRanges,
          topStudents,
        };
      })
    );

    const overallAverageMarks =
      gradedCount > 0 ? (marksSum / gradedCount).toFixed(2) : 0;

    res.status(200).json({
      summary: {
        totalAssignments,
        totalSubmissions,
        totalGraded,
        totalPending: totalSubmissions - totalGraded,
        totalLate,
        averageMarks: overallAverageMarks,
      },
      assignments: assignmentSummary,
    });
   } catch (err) {
    res.status(400).json({ message: `Error Occurred: ${err.message}` });
  }
});
app.get("/student/dashboard", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "Student") {
      return res.status(403).json({ message: "Access denied. Students only." });
    }

    const studentId = new mongoose.Types.ObjectId(req.user.id);
    const assignments = await Assignment.find({ status: "active", section: req.user.section });
    const submissions = await Submission.find({ student: studentId }).populate("assignment");

    let totalAssignments = assignments.length;
    let submitted = 0;
    let pending = 0;
    let onTime = 0;
    let late = 0;
    let totalMarks = 0;
    let gradedCount = 0;
    const subjectStats = {};

    const assignmentSummary = await Promise.all(
      assignments.map(async (assignment) => {
        const submission = submissions.find(
          (s) => s.assignment && s.assignment._id.toString() === assignment._id.toString()
        );

        const subject = assignment.subject || "General";
        if (!subjectStats[subject]) {
          subjectStats[subject] = {
            total: 0,
            submitted: 0,
            graded: 0,
            late: 0,
            totalMarks: 0,
            onTime: 0,
          };
        }
        subjectStats[subject].total++;

        let status = "Pending";
        let action = "Upload Submission";
        let submissionId;
        let canResubmit = false;

        if (submission) {
          submitted++;
          subjectStats[subject].submitted++;
          status = submission.status === "graded" ? "Graded" : "Submitted";
          action = "View Submission";
          submissionId = submission._id;

          // Logic for canResubmit
          const now = new Date();
          const dueDate = new Date(assignment.dueDate);
          canResubmit = now <= dueDate && submission.status !== "graded";

          if (submission.status === "graded") {
            gradedCount++;
            subjectStats[subject].graded++;
            if (submission.marks?.total) {
              totalMarks += submission.marks.total;
              subjectStats[subject].totalMarks += submission.marks.total;
            }
          }

          if (submission.isLate) {
            late++;
            subjectStats[subject].late++;
          } else {
            onTime++;
            subjectStats[subject].onTime++;
          }
        } else {
          const now = new Date();
          if (now > new Date(assignment.dueDate)) {
            status = "Late";
            late++;
            subjectStats[subject].late++;
          } else {
            pending++;
          }
        }

        return {
          _id: assignment._id,
          title: assignment.title,
          subject,
          dueDate: assignment.dueDate,
          status,
          action,
          submissionId,
          canResubmit, // NEW FLAG
        };
      })
    );

    const averageMarks = gradedCount > 0 ? (totalMarks / gradedCount).toFixed(2) : 0;

    const subjectAnalytics = Object.keys(subjectStats).map((subject) => {
      const data = subjectStats[subject];
      const avgMarks = data.graded > 0 ? (data.totalMarks / data.graded).toFixed(2) : 0;
      const onTimeRate = data.submitted > 0 ? ((data.onTime / data.submitted) * 100).toFixed(1) : 0;
      return {
        subject,
        totalAssignments: data.total,
        submitted: data.submitted,
        graded: data.graded,
        late: data.late,
        averageMarks: avgMarks,
        onTimeRate: `${onTimeRate}%`,
      };
    });

    res.status(200).json({
      summary: {
        totalAssignments,
        submitted,
        pending,
        onTime,
        late,
        averageMarks,
        feedbackCount: gradedCount,
      },
      assignments: assignmentSummary,
      subjectAnalytics,
    });
  } catch (err) {
    res.status(400).json({ message: `Error Occurred: ${err.message}` });
  }
});
