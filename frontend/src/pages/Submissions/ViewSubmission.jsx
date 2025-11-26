import React, { useEffect, useState, useContext } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Divider,
  Alert,
  Button,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext"; // IMPORTANT
import { getSubmission } from "../../api/submissions";

export default function ViewSubmission() {
  const { id } = useParams();
  const { user } = useContext(AuthContext); // get logged-in user
  const [sub, setSub] = useState(null);
  const [message, setMessage] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    getSubmission(id)
      .then((res) => {
        setSub(res.data);
        setMessage(res.data.message || "");
      })
      .catch((err) =>
        setMessage(err.response?.data?.message || "Error loading submission")
      );
  }, [id]);

  if (!sub) return <div>Loading...</div>;

  const assignment = sub.assignment;
  const isTeacher = user?.role === "Teacher";
  const isStudent = user?.role === "Student";

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5">{assignment.title}</Typography>
        <Typography sx={{ mt: 1 }}>{assignment.description}</Typography>

        {/* Rubrics */}
        {assignment.rubric && assignment.rubric.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Rubrics</Typography>
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
          </>
        )}

        <Divider sx={{ my: 2 }} />

        {message && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <Typography>
          <strong>Submitted At:</strong>{" "}
          {new Date(sub.submittedAt).toLocaleString()}
        </Typography>

        {/* Attachments */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Attachments:</Typography>
          {sub.attachments?.length > 0 ? (
            sub.attachments.map((a) => (
              <Box key={a.filename} sx={{ mb: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() =>
                    window.open(
                      a.url.startsWith("http")
                        ? a.url
                        : `http://localhost:3000${a.url}`,
                      "_blank"
                    )
                  }
                >
                  {a.filename}
                </Button>
              </Box>
            ))
          ) : (
            <Typography>No files uploaded.</Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Marks + Feedback (visible to both) */}
        <Typography>
        <strong>Marks:</strong>{" "}
        {sub.status === "graded" ? sub.marks.total : "Not graded yet"}
      </Typography>
      <Typography>
        <strong>Feedback:</strong>{" "}
        {sub.status === "graded" && sub.feedback ? sub.feedback : "Not graded yet"}
      </Typography>


        <Divider sx={{ my: 2 }} />

        {/* 🔹 TEACHER-ONLY: Grade Button */}
        {isTeacher && (
          <Button
            variant="contained"
            color="primary"
            sx={{ mr: 2 }}
            onClick={() => nav(`/submissions/${id}/grade`)}
          >
            Grade Submission
          </Button>
        )}

        {/* 🔹 Role-based Back Button */}
        <Button
          variant="outlined"
          onClick={() =>
            nav(isTeacher ? "/teacher/dashboard" : "/student/dashboard")
          }
        >
          Back to Dashboard
        </Button>
      </Paper>
    </Container>
  );
}
