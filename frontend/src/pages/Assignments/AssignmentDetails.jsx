import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Divider,
} from "@mui/material";
import { getAssignment } from "../../api/assignments";
import api from "../../api/axiosInstance";
import { useParams, useNavigate } from "react-router-dom";

export default function AssignmentDetails() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    getAssignment(id)
      .then((res) => setAssignment(res.data))
      .catch((err) =>
        alert(err.response?.data?.message || "Error loading assignment")
      );
  }, [id]);

  if (!assignment) return <div>Loading...</div>;

  // Fetch submissions and navigate
  const handleViewSubmissions = async () => {
    try {
      const res = await api.get(`/assignments/${id}/allSubmissions`);

      if (!res.data || res.data.length === 0) {
        alert("No submissions yet for this assignment.");
        return;
      }

      // Navigate to a submissions page with the data
      nav(`/assignments/${id}/allSubmissions`, { state: { submissions: res.data } });
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Error fetching submissions. You may not be authorized."
      );
    }
  };

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        {/* Title */}
        <Typography variant="h4" fontWeight={600}>
          {assignment.title}
        </Typography>

        {/* Description */}
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          {assignment.description}
        </Typography>

        {/* Due Date */}
        <Box sx={{ mt: 2 }}>
          <Typography fontWeight={500}>
            <strong>Due Date:</strong>{" "}
            {new Date(assignment.dueDate).toLocaleString()}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Attachments */}
        <Typography variant="h6" sx={{ mb: 1 }}>
          Attachments
        </Typography>

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
                alignItems: "center",
              }}
            >
              <Typography>{file.filename}</Typography>

              <Button
                variant="outlined"
                onClick={() =>
                  window.open(file.fullUrl || `http://localhost:3000${file.url}`, "_blank")
                }
              >
                View File
              </Button>
            </Box>
          ))
        ) : (
          <Typography>No files attached</Typography>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Rubric */}
        {assignment.rubric && assignment.rubric.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Rubric
            </Typography>

            {assignment.rubric.map((r, i) => (
              <Box
                key={i}
                sx={{
                  p: 1,
                  mb: 1,
                  border: "1px solid #ddd",
                  borderRadius: 1,
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

        {/* Buttons */}
        <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
          {assignment.canEdit && (
            <Button
              variant="contained"
              onClick={() =>
                nav(`/teacher/assignments/${assignment._id}/edit`)
              }
            >
              Edit Assignment
            </Button>
          )}

          <Button
            variant="outlined"
            onClick={handleViewSubmissions} // Updated
          >
            View Submissions
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            onClick={() => nav("/teacher/dashboard")}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
