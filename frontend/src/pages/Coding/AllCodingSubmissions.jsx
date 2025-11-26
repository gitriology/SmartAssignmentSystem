import React, { useEffect, useState, useContext } from "react";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Button,
} from "@mui/material";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function AllCodingSubmissions() {
  const { user } = useContext(AuthContext);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true); // NEW FIX
  const nav = useNavigate();

  // Fetch submissions AFTER hooks have run
  useEffect(() => {
    if (!user) return; // don't fetch until user is ready

    const fetchSubs = async () => {
      try {
        let res;

        if (user.role === "Student") {
          res = await api.get("/coding/my/submissions");
        } else if (user.role === "Teacher") {
          res = await api.get("/coding/all/submissions");
        }

        setSubs(res.data || []);
      } catch (err) {
        console.log(err);
        alert("Error loading submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubs();
  }, [user]);

  // UI Conditions (safe - AFTER hooks)
  if (!user) return <div>Loading user...</div>;
  if (loading) return <div>Loading submissions...</div>;

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4">
          {user.role === "Teacher"
            ? "All Coding Submissions"
            : "My Coding Submissions"}
        </Typography>

        <Table sx={{ mt: 3 }}>
          <TableHead>
            <TableRow>
              {user.role === "Teacher" && <TableCell>Student</TableCell>}
              <TableCell>Problem</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Submitted At</TableCell>
              <TableCell>View</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {subs.length > 0 ? (
              subs.map((s) => (
                <TableRow key={s._id}>
                  {user.role === "Teacher" && (
                    <TableCell>{s.student?.name || "Unknown"}</TableCell>
                  )}

                  <TableCell>{s.problem?.title || "Problem"}</TableCell>

                  <TableCell>
                    {s.passed} / {s.total}
                  </TableCell>

                  <TableCell>
                    {new Date(s.createdAt).toLocaleString("en-GB")}
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="outlined"
                      onClick={() => nav(`/coding/submission/${s._id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No submissions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
