import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import {
  Button,
  Typography,
  Paper,
  Container,
  Box,
  Alert,
  LinearProgress,
} from "@mui/material";

export default function ResubmitSubmission() {
  const { id } = useParams();
  const [files, setFiles] = useState([]);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Fetch submission info to display existing details
  useEffect(() => {
    api
      .get(`/submissions/${id}`)
      .then((res) => setSubmission(res.data))
      .catch((err) =>
        setMessage(err.response?.data?.message || "Error loading submission")
      );
  }, [id]);

  const handleFileChange = (e) => setFiles(e.target.files);

  const handleSubmit = async () => {
    if (files.length === 0) {
      setMessage("Please select at least one file to resubmit.");
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) formData.append("attachments", files[i]);

    try {
      setLoading(true);
      const res = await api.put(`/submissions/${id}/resubmit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(res.data.message);
      navigate("/student/my"); // back to submissions
    } catch (err) {
      setMessage(err.response?.data?.message || "Error resubmitting");
    } finally {
      setLoading(false);
    }
  };

  if (!submission) return <div>Loading...</div>;

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
          Resubmit: {submission.assignment?.title}
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          {submission.assignment?.description}
        </Typography>

        {submission.submittedAt && (
          <Typography sx={{ mb: 2 }}>
            Submitted At: {new Date(submission.submittedAt).toLocaleString()}
          </Typography>
        )}

        {/* Display existing attachments */}
        <Box sx={{ mb: 2 }}>
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
            <Typography>No files uploaded yet.</Typography>
          )}
        </Box>

        {message && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            style={{ display: "block", marginBottom: "10px" }}
          />
          <Typography variant="caption" color="text.secondary">
            You can select multiple files to resubmit.
          </Typography>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            Resubmit
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate("/student/my")}
            disabled={loading}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
