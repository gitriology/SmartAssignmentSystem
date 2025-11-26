import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import {
  Container,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";

export default function AllSubmissions() {
  const { id } = useParams(); // assignment ID
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await api.get(`/assignments/${id}/allSubmissions`);
        setSubmissions(res.data);
      } catch (err) {
        setMessage(err.response?.data?.message || "Error fetching submissions");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [id]);

  if (loading)
    return (
      <Container sx={{ mt: 5, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );

  return (
    <Container sx={{ mt: 5 }}>
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Submissions
        </Typography>

        {message && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {submissions.length === 0 ? (
          <Typography>No submissions found for this assignment.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell>Submitted At</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Marks</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map((s, idx) => (
                <TableRow key={s._id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{s.student?.name || "N/A"}</TableCell>
                  <TableCell>
                    {new Date(s.submittedAt).toLocaleString()}
                  </TableCell>
                  <TableCell>{s.status}</TableCell>
                  <TableCell>
        {s.marks?.total ?? 0} /{" "}
        {s.assignment?.rubric?.reduce((sum, r) => sum + (r.marks || 0), 0) ?? 0}
      </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => nav(`/submissions/${s._id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Button
          variant="outlined"
          sx={{ mt: 3 }}
          onClick={() => nav("/teacher/dashboard")}
        >
          Back to Dashboard
        </Button>
      </Paper>
    </Container>
  );
}
