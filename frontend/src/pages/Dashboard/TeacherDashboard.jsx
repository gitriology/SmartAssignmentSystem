import React, { useEffect, useState, useContext } from "react";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { deleteAssignment } from "../../api/assignments";
import api from "../../api/axiosInstance";
import { AuthContext } from "../../context/AuthContext";

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const nav = useNavigate();
  const { user } = useContext(AuthContext);

  // Load assignments
  useEffect(() => {
    api
      .get("/teacher/dashboard")
      .then((res) => setData(res.data))
      .catch((err) => alert(err.message));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assignment?"))
      return;

    try {
      await deleteAssignment(id);
      alert("Assignment deleted successfully");
      // Refresh dashboard data
      api
        .get("/teacher/dashboard")
        .then((res) => setData(res.data))
        .catch((err) => alert(err.message));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  if (!data) return <div>Loading...</div>;

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4">
          Welcome, {user?.name || "Teacher"}
        </Typography>

        <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            onClick={() => nav("/teacher/assignments/create")}
          >
            Create Assignment
          </Button>
          <Button variant="outlined" onClick={() => nav("/teacher/analytics")}>
            Analytics
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => nav(`/teacher/profile/${user?.id}`)}
          >
            My Profile
          </Button>
           <Button
            variant="contained"
            color="success"
            onClick={() => nav("/coding/create")}
          >
            Create Coding Problem
          </Button>
          <Button
            variant="outlined"
            color="success"
            onClick={() => nav("/coding/problems")}
          >
            View Coding Problems
          </Button>
           <Button
            variant="outlined"
            color="info"
            onClick={() => nav("/coding/all-submissions")}
          >
            View All Coding Submissions
          </Button>
        </Box>

        <Typography variant="h6" sx={{ mt: 3 }}>
          Assignments
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Submissions</TableCell>
              <TableCell>Graded</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.assignments.length > 0 ? (
              data.assignments.map((a, i) => (
                <TableRow key={a._id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{a.title}</TableCell>
                  <TableCell>
                    {new Date(a.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{a.submissions}</TableCell>
                  <TableCell>{a.graded}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => nav(`/assignments/${a._id}`)}
                    >
                      View
                    </Button>
                    {a.canEdit !== false && (
                      <Button
                        size="small"
                        onClick={() =>
                          nav(`/teacher/assignments/${a._id}/edit`)
                        }
                      >
                        Edit
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleDelete(a._id)}
                    >
                      Delete
                    </Button>
                    {a.submissions > 0 && (
                      <Button
                        size="small"
                        color="secondary"
                        onClick={() =>
                          nav(`/assignments/${a._id}/allSubmissions`)
                        }
                      >
                        View Submissions
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No assignments created yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
