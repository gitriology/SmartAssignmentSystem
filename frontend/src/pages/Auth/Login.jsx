import React, { useState, useContext } from "react";
import { Container, Paper, Typography, TextField, Button, Stack } from "@mui/material";
import { loginApi } from "../../api/auth";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useContext(AuthContext);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginApi(form);

      // backend returns { token }
      const token = res.data.token;
      login(token);

      const payload = JSON.parse(atob(token.split(".")[1]));

      if (payload.role === "Teacher") nav("/teacher/dashboard");
      else nav("/student/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 10 }}>
        <Typography variant="h5" mb={2}>Login</Typography>

        <form onSubmit={submit}>
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            required
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <TextField
            fullWidth
            label="Password"
            margin="normal"
            type="password"
            required
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button variant="contained" type="submit">
              Login
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => nav("/register")}
            >
              Register
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
