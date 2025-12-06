const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const cloudinary = require("./cloudinary");

// Assignments storage
const assignmentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "assignments",  // folder name in Cloudinary
    allowed_formats: ["pdf", "jpg", "jpeg", "png"],
    resource_type: "auto",  // automatically handles pdf/images
  },
});

const uploadAssignmentsCloud = multer({ storage: assignmentStorage });

// Submissions storage
const submissionStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "submissions",
    allowed_formats: ["pdf", "jpg", "jpeg", "png"],
    resource_type: "auto",
  },
});

const uploadSubmissionsCloud = multer({ storage: submissionStorage });

module.exports = { uploadAssignmentsCloud, uploadSubmissionsCloud };
