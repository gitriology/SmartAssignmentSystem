import React, { useEffect, useState, useContext } from "react";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
} from "@mui/material";
import api from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const nav = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    api
      .get("/student/dashboard")
      .then((res) => setData(res.data))
      .catch((err) => alert(err.message));
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4">Welcome, {user?.name || "Student"}</Typography>

        {/* Summary */}
        <Typography variant="h6" sx={{ mt: 2 }}>
          Summary
        </Typography>
        <Typography>
          Assignments: {data.summary.totalAssignments} • Submitted:{" "}
          {data.summary.submitted} • Pending: {data.summary.pending} •
          Average Marks: {data.summary.averageMarks}
        </Typography>

        <Button
          variant="outlined"
          color="secondary"
          sx={{ mt: 2 }}
          onClick={() => nav(`/student/profile/${user?.id}`)}
        >
          My Profile
        </Button>
        <Button
  variant="contained"
  color="success"
  sx={{ mt: 2, mr: 2, ml:2 }}
  onClick={() => nav("/coding/problems")}
>
  Browse Coding Problems
</Button>

<Button
  variant="outlined"
  color="info"
  sx={{ mt: 2 }}
  onClick={() => nav("/coding/my")}
>
  My Coding Submissions
</Button>

        {/* Assignments Table */}
        <Typography variant="h6" sx={{ mt: 3 }}>
          Assignments
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Due</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.assignments.length > 0 ? (
              data.assignments.map((a, i) => (
                <TableRow key={a._id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{a.title}</TableCell>
                  <TableCell>{a.subject}</TableCell>
                  <TableCell>{new Date(a.dueDate).toLocaleDateString("en-GB")}</TableCell>
                  <TableCell>{a.status}</TableCell>
                  <TableCell sx={{ display: "flex", gap: 1 }}>
                    {/* Upload for pending assignments with no submission */}
                    {!a.submissionId && a.status.toLowerCase() === "pending" && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => nav(`/assignments/${a._id}/submit`)}
                      >
                        Upload
                      </Button>
                    )}

                    {/* Resubmit for assignments that allow resubmission */}
                    {a.submissionId && a.canResubmit && (
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        onClick={() =>
                          nav(`/submissions/${a.submissionId}/resubmit`)
                        }
                      >
                        Resubmit
                      </Button>
                    )}

                    {/* View for submitted/graded assignments */}
                    {a.submissionId && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => nav(`/submissions/${a.submissionId}`)}
                      >
                        View
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No assignments available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
