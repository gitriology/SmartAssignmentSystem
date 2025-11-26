import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Divider,
  Alert
} from "@mui/material";
import FileUpload from "../../components/FileUpload";
import { submitAssignment, getAssignment } from "../../api/assignments";
import { useParams, useNavigate } from "react-router-dom";

export default function UploadSubmission() {
  const { id } = useParams();
  const [files, setFiles] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [message, setMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    getAssignment(id)
      .then((res) => setAssignment(res.data))
      .catch((err) =>
        setMessage(err.response?.data?.message || "Error loading assignment")
      );
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    if (!files.length) return setMessage("Please select at least one file");

    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));

    try {
      const res = await submitAssignment(id, fd);
      setMessage(res.data.message);
      setUploadedFiles(res.data.data.attachments || []);
      setFiles([]);

      setTimeout(() => nav("/student/dashboard"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Submission failed");
    }
  };

  if (!assignment) return <div>Loading...</div>;

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        {/* Title */}
        <Typography variant="h5" fontWeight={600}>
          {assignment.title}
        </Typography>

        {/* Description */}
        <Typography sx={{ mt: 1 }}>{assignment.description}</Typography>

        <Divider sx={{ my: 2 }} />

        {/* ⭐ NEW: Assignment Attachments */}
        <Typography variant="h6">Assignment Attachments</Typography>

        {assignment.attachments && assignment.attachments.length > 0 ? (
          assignment.attachments.map((file, idx) => (
            <Box
              key={idx}
              sx={{
                mb: 1,
                p: 1,
                border: "1px solid #ccc",
                borderRadius: 1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <Typography>{file.filename}</Typography>
              <Button
                variant="outlined"
                onClick={() =>
                  window.open(
                    file.url.startsWith("http")
                      ? file.url
                      : `http://localhost:3000${file.url}`,
                    "_blank"
                  )
                }
              >
                View File
              </Button>
            </Box>
          ))
        ) : (
          <Typography>No files attached to this assignment</Typography>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Rubrics */}
        {assignment.rubric && assignment.rubric.length > 0 && (
          <>
            <Typography variant="h6">Rubrics</Typography>
            {assignment.rubric.map((r, i) => (
              <Box
                key={i}
                sx={{
                  p: 1,
                  mb: 1,
                  border: "1px solid #ddd",
                  borderRadius: 1
                }}
              >
                <Typography>
                  <strong>Criteria:</strong> {r.criteria}
                </Typography>
                <Typography>
                  <strong>Max Marks:</strong> {r.marks ?? "N/A"}
                </Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* Backend message */}
        {message && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {/* File Upload */}
        <FileUpload onFiles={(f) => setFiles(f)} />

        {/* Selected Files Preview */}
{files.length > 0 && (
  <Box sx={{ mt: 2 }}>
    <Typography variant="subtitle1">Files Selected:</Typography>
    <ul>
      {files.map((file, i) => (
        <li
          key={i}
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          {file.name} — {(file.size / 1024).toFixed(1)} KB
          <Button
            variant="outlined"
            size="small"
            onClick={() => window.open(URL.createObjectURL(file), "_blank")}
          >
            View File
          </Button>
        </li>
      ))}
    </ul>
  </Box>
)}


        {/* Buttons */}
        <Button variant="contained" onClick={submit} sx={{ mt: 2 }}>
          Submit
        </Button>

        <Button
          variant="outlined"
          sx={{ mt: 2, ml: 2 }}
          onClick={() => nav("/student/dashboard")}
        >
          Cancel
        </Button>
      </Paper>
    </Container>
  );
}
