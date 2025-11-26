import React, { useEffect, useState } from "react";
import { getMyCodingSubmissions } from "../../api/coding";
import { Container, Paper, Typography } from "@mui/material";

export default function MyCodingSubmissions() {
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    getMyCodingSubmissions().then(res => setSubs(res.data));
  }, []);

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4">My Coding Submissions</Typography>

        {subs.map(s => (
          <Paper key={s._id} sx={{ p: 2, mt: 2 }}>
            <Typography><b>Problem:</b> {s.problem.title}</Typography>
            <Typography><b>Score:</b> {s.passed}/{s.total}</Typography>
          </Paper>
        ))}
      </Paper>
    </Container>
  );
}
