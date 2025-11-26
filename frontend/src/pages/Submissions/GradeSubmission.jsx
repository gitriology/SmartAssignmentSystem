import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";

export default function GradeSubmission() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [rubricMarks, setRubricMarks] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [message, setMessage] = useState("");
  const nav = useNavigate();

  // Fetch submission
  useEffect(() => {
    api
      .get(`/submissions/${id}`)
      .then((res) => {
        setSubmission(res.data);

        // Initialize rubric marks
        if (res.data.assignment?.rubric) {
          setRubricMarks(
            res.data.assignment.rubric.map((r) => ({
              criteria: r.criteria,
              maxMarks: r.maxMarks || 0,
              score: 0,
            }))
          );
        }
      })
      .catch((err) =>
        setMessage(err.response?.data?.message || "Error loading submission")
      );
  }, [id]);

  if (!submission) return <div>Loading...</div>;

  const assignment = submission.assignment;

  // Submit grade
  const handleGrade = async () => {
    // Validation: no empty scores
    if (rubricMarks.some((r) => r.score === "")) {
      return setMessage("Please enter marks for all criteria.");
    }

    // Compute total
    const total = rubricMarks.reduce((sum, r) => sum + Number(r.score || 0), 0);

    const payload = {
      marks: {
        total,
        perCriteria: rubricMarks,
      },
      feedback,
    };

    try {
      const res = await api.put(`/submissions/${id}/grade`, payload);
      setMessage(res.data.message);
      setTimeout(() => nav("/teacher/dashboard"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Grading failed");
    }
  };

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5">{assignment.title}</Typography>
        <Typography sx={{ mt: 1 }}>{assignment.description}</Typography>

        {/* RUBRICS */}
        {assignment.rubric?.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Rubrics</Typography>

            {assignment.rubric.map((r, i) => (
              <Box
                key={i}
                sx={{
                  p: 2,
                  mb: 2,
                  border: "1px solid #ccc",
                  borderRadius: 1,
                }}
              >
                <Typography>
                  <strong>Criteria:</strong> {r.criteria}
                </Typography>
                <Typography>
                  <strong>Max Marks:</strong> {r.marks}
                </Typography>

                <TextField
                  label={`Marks (Max ${r.marks})`}
                  type="number"
                  sx={{ mt: 1 }}
                  value={rubricMarks[i]?.score}
                  onChange={(e) => {
                    const val = Number(e.target.value);

                    if (val > r.maxMarks) {
                      alert(
                        `Marks for "${r.criteria}" cannot exceed ${r.maxMarks}`
                      );
                      return;
                    }

                    const updated = [...rubricMarks];
                    updated[i].score = val;
                    setRubricMarks(updated);
                  }}
                  inputProps={{ min: 0, max: r.marks }}
                />
              </Box>
            ))}
          </Box>
        )}

        {/* ATTACHMENTS */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Student Submission:</Typography>
          {submission.attachments?.length > 0 ? (
            submission.attachments.map((a) => (
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
            <Typography>No submitted files</Typography>
          )}
        </Box>

        {/* ERROR / SUCCESS MESSAGE */}
        {message && (
          <Alert severity="info" sx={{ my: 2 }}>
            {message}
          </Alert>
        )}

        {/* FEEDBACK */}
        <Box sx={{ mt: 2, maxWidth: 400 }}>
          <TextField
            label="Feedback"
            multiline
            minRows={3}
            fullWidth
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </Box>

        {/* ACTION BUTTONS */}
        <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
          <Button variant="contained" onClick={handleGrade}>
            Submit Grade
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
