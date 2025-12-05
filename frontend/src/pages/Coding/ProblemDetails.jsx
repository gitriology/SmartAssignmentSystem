import React, { useEffect, useState, useContext } from "react";
import { getProblems, deleteProblem } from "../../api/coding";   // ✅ FIXED
import { useNavigate } from "react-router-dom";
import { Container, Paper, Button, Typography } from "@mui/material";
import { AuthContext } from "../../context/AuthContext";

export default function ProblemsList() {
  const [problems, setProblems] = useState([]);
  const nav = useNavigate();
  const { user } = useContext(AuthContext);

  // ✅ FIXED delete handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this problem?")) return;

    try {
      await deleteProblem(id);
      alert("Problem deleted");

      // 🔥 Update UI immediately (best practice)
      setProblems((prev) => prev.filter((p) => p._id !== id));

    } catch (err) {
      console.error(err);
      alert("Error deleting problem");
    }
  };

  useEffect(() => {
    getProblems().then((res) => setProblems(res.data));
  }, []);

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4">Coding Problems</Typography>

        {user?.role === "Teacher" && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => nav("/coding/create")}
          >
            Create Problem
          </Button>
        )}

        {problems.map((p) => (
          <Paper key={p._id} sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6">{p.title}</Typography>

            <Button onClick={() => nav(`/coding/problem/${p._id}`)}>
              View Problem
            </Button>

            {user?.role === "Teacher" && (
              <Button
                variant="contained"
                color="error"
                sx={{ ml: 2 }}
                onClick={() => handleDelete(p._id)}
              >
                Delete
              </Button>
            )}
          </Paper>
        ))}
      </Paper>
    </Container>
  );
}
