import React, { useEffect, useState, useContext } from "react";
import { Container, Paper, Typography, Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Alert } from "@mui/material";
import api from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function StudentSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [message, setMessage] = useState("");
  const nav = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    api.get("/submissions/my")
      .then(res => setSubmissions(res.data))
      .catch(err => setMessage(err.response?.data?.message || "Error loading submissions"));
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5">My Submissions</Typography>
        {message && <Alert severity="info" sx={{ my: 2 }}>{message}</Alert>}

        {submissions.length === 0 ? (
          <Typography sx={{ mt: 2 }}>No submissions yet.</Typography>
        ) : (
          <Table sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Assignment</TableCell>
                <TableCell>Submitted At</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Marks</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map((s, i) => (
                <TableRow key={s._id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{s.assignment?.title}</TableCell>
                  <TableCell>{new Date(s.submittedAt).toLocaleString()}</TableCell>
                  <TableCell>{s.status}</TableCell>
                  <TableCell>{s.marks?.total ?? "-"}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" onClick={() => nav(`/submissions/${s._id}`)}>
                      View
                    </Button>
                    {s.status !== "graded" && new Date(s.assignment?.dueDate) > new Date() && (
                      <Button size="small" sx={{ ml: 1 }} variant="contained" onClick={() => nav(`/submissions/${s._id}/resubmit`)}>
                        Resubmit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Container>
  );
}
