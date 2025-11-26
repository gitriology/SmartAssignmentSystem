import React from "react";
import { Container, Typography, Button, Box, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();
  return (
    <Container maxWidth="sm" sx={{ mt: 12 }}>
      <Paper sx={{ p: 5 }}>
        <Typography variant="h3">Welcome to EduSmart</Typography>
        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Smart Assignment & Feedback Management
        </Typography>
        <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
          <Button variant="contained" onClick={() => nav("/register")}>Register</Button>
          <Button variant="outlined" onClick={() => nav("/login")}>Login</Button>
        </Box>
        
      </Paper>
    </Container>
  );
}
