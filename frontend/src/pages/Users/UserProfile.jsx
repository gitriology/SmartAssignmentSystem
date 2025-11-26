import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import api from "../../api/axiosInstance";
import { AuthContext } from "../../context/AuthContext";

export default function UserProfile() {
  const { user } = useContext(AuthContext); // decoded JWT
  const { id } = useParams(); // user ID from route
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const nav = useNavigate();

  // Load user data
  useEffect(() => {
    if (!user) return;

    api
      .get(`/users/${id}`)
      .then((res) => {
        setFormData({
          name: res.data.name || "",
          email: res.data.email || "",
          password: "",
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load user");
        setLoading(false);
      });
  }, [id, user]);

  // Handle form change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
      };
      if (formData.password) payload.password = formData.password;

      const res = await api.put(`/users/${id}`, payload);
      setSuccess(res.data.message);
      setFormData({ ...formData, password: "" });

      // Optional: update JWT user context if you want immediate reflection
      // updateUser({ ...user, name: formData.name, email: formData.email });

      setTimeout(() => {
        nav("/teacher/dashboard"); // redirect after success
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 4, maxWidth: 600, margin: "auto" }}>
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {/* Editable Name */}
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          {/* Section from JWT */}
          <TextField
            label="Section"
            name="section"
            value={user?.sectionName || ""}
            disabled
          />

          {/* Editable Email */}
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            required
          />

          {/* Editable Password */}
          <TextField
            label="New Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            type="password"
            placeholder="Leave blank to keep current"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => nav("/teacher/dashboard")}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
