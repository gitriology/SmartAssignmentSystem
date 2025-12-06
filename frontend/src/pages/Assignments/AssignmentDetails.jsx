// src/pages/Assignments/AssignmentDetails.jsx
import React, { useEffect, useState } from "react";
import { Container, Paper, Typography, Box, Divider, Button } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";

export default function AssignmentDetails() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    api.get(`/assignments/${id}`)
      .then(res => setAssignment(res.data))
      .catch(err => alert(err.response?.data?.message || "Error fetching assignment"));
  }, [id]);

  if (!assignment) return <div>Loading...</div>;

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4">{assignment.title}</Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Subject: {assignment.subject} | Due: {new Date(assignment.dueDate).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
})}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body1" sx={{ mb: 2 }}>
          {assignment.description}
        </Typography>

        {assignment.attachments && assignment.attachments.length > 0 && (
          <>
            <Typography variant="h6">Attachments:</Typography>
            <ul>
              {assignment.attachments.map((file, i) => (
                <li key={i}>
                  <a href={file.url} target="_blank" rel="noreferrer">{file.filename}</a> ({(file.size/1024).toFixed(1)} KB)
                </li>
              ))}
            </ul>
          </>
        )}

        {assignment.rubric && assignment.rubric.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mt: 2 }}>Rubric:</Typography>
            <ul>
              {assignment.rubric.map((r, i) => (
                <li key={i}>{r.criteria} — {r.marks} marks</li>
              ))}
            </ul>
          </>
        )}

        <Button variant="outlined" sx={{ mt: 2 }} onClick={() => nav(-1)}>Back</Button>
      </Paper>
    </Container>
  );
}
