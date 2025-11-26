import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack
} from "@mui/material";
import { registerApi } from "../../api/auth";
import api from "../../api/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    subject: "",
    section: ""
  });

  const [sections, setSections] = useState([]);

  const { login } = useContext(AuthContext);
  const nav = useNavigate();

  // Fetch sections from backend
  useEffect(() => {
    api
      .get("/sections")
      .then((res) => setSections(res.data))
      .catch(() => setSections([]));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await registerApi(form);

      const token =
        res.data.token?.token ? res.data.token.token : res.data.token;

      login(token);
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role === "Teacher") nav("/teacher/dashboard");
      else nav("/student/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 8 }}>
        <Typography variant="h5" mb={2}>
          Register
        </Typography>

        <form onSubmit={submit}>
          <TextField
            label="Name"
            fullWidth
            required
            margin="normal"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <TextField
            label="Email"
            fullWidth
            required
            margin="normal"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <TextField
            label="Password"
            fullWidth
            required
            margin="normal"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <TextField
            select
            label="Role"
            fullWidth
            required
            margin="normal"
            value={form.role} // ✅ Fixed
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <MenuItem value="Teacher">Teacher</MenuItem>
            <MenuItem value="Student">Student</MenuItem>
          </TextField>

          {form.role === "Teacher" && (
            <TextField
              label="Subject"
              fullWidth
              required
              margin="normal"
              value={form.subject} // ✅ Fixed
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          )}

          <TextField
            select
            label="Section"
            fullWidth
            required
            margin="normal"
            value={form.section} // ✅ Already correct
            onChange={(e) => setForm({ ...form, section: e.target.value })}
          >
            {sections.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button variant="contained" type="submit">
              Register
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              onClick={() => nav("/login")}
            >
              Login Instead
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
