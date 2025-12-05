import React, { useEffect, useState, useContext } from "react";
import { getProblems } from "../../api/coding";
import { useNavigate } from "react-router-dom";
import { Container, Paper, Button, Typography } from "@mui/material";
import { AuthContext } from "../../context/AuthContext";

export default function ProblemsList() {
  const [problems, setProblems] = useState([]);
  const nav = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
  getProblems().then((res) => {
    console.log("API response:", res.data);
    setProblems(res.data);
  }).catch(err => console.error(err));
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


        {problems.map(p => (
          <Paper key={p._id} sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6">{p.title}</Typography>
            <Button onClick={() => nav(`/coding/problem/${p._id}`)}>
              View Problem
            </Button>
          </Paper>
        ))}
      </Paper>
    </Container>
  );
}
