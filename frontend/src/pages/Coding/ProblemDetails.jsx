import React, { useEffect, useState } from "react";
import { getProblem } from "../../api/coding";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Paper, Button, Typography } from "@mui/material";

export default function ProblemDetails() {
  const { id } = useParams();
  console.log("Hi",id);
  const [problem, setProblem] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    getProblem(id).then(res => setProblem(res.data));
  }, [id]);

  if (!problem) return "Loading...";

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4">{problem.title}</Typography>
        <Typography sx={{ mt: 2 }}>{problem.description}</Typography>

        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => nav(`/coding/solve/${id}`)}
        >
          Solve Problem
        </Button>
      </Paper>
    </Container>
  );
}
