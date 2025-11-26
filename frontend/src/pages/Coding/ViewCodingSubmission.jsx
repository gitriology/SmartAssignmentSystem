import React, { useEffect, useState, useContext } from "react";
import {
  Container,
  Paper,
  Typography,
  Chip,
  Box,
  Divider,
  Button,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { AuthContext } from "../../context/AuthContext";

export default function ViewCodingSubmission() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  const nav = useNavigate();

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await api.get(`/coding/submission/${id}`);
        setSubmission(res.data);
      } catch (err) {
        console.error(err);
        alert("Error loading submission");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!submission) return <div>Submission not found.</div>;

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4">Submission Details</Typography>

        <Typography sx={{ mt: 1 }}>
          <strong>Problem:</strong> {submission.problem?.title}
        </Typography>

        {user.role === "Teacher" && (
          <Typography>
            <strong>Student:</strong> {submission.student?.name}
          </Typography>
        )}

        <Typography>
          <strong>Language:</strong> {submission.language}
        </Typography>

        <Typography>
          <strong>Score:</strong> {submission.passed} / {submission.total}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h5">Code:</Typography>
        <Paper sx={{ p: 2, mt: 1, background: "#1e1e1e", color: "#fff" }}>
          <pre>{submission.code}</pre>
        </Paper>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h5">Testcase Results</Typography>

        {submission.details.map((tc, i) => (
          <Paper
            key={i}
            sx={{
              p: 2,
              mb: 2,
              borderLeft: tc.ok ? "5px solid green" : "5px solid red",
            }}
          >
            <Typography variant="subtitle1">
              Testcase #{i + 1}{" "}
              {tc.ok ? (
                <Chip label="Passed" color="success" size="small" />
              ) : (
                <Chip label="Failed" color="error" size="small" />
              )}
            </Typography>

            <Typography sx={{ mt: 1 }}>
              <strong>Input:</strong>
            </Typography>
            <pre>{tc.input}</pre>

            <Typography>
              <strong>Expected:</strong>
            </Typography>
            <pre>{tc.expected}</pre>

            <Typography>
              <strong>Your Output:</strong>
            </Typography>
            <pre>{tc.stdout}</pre>
          </Paper>
        ))}

        <Button sx={{ mt: 2 }} variant="contained" onClick={() => nav(-1)}>
          Back
        </Button>
      </Paper>
    </Container>
  );
}
