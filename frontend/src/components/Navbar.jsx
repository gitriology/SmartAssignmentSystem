import React, { useContext } from "react";
import { AppBar, Toolbar, Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ cursor: "pointer" }} onClick={() => navigate(user.role === "Teacher" ? "/teacher/dashboard" : "/student/dashboard")}>
          EduSmart
        </Typography>

        <Box>
          {user.role === "Teacher" ? (
            <>
              <Button color="inherit" onClick={() => navigate("/teacher/assignments/create")}>
                Create
              </Button>
              <Button color="inherit" onClick={() => navigate("/teacher/analytics")}>
                Analytics
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate("/student/analytics")}>
                Analytics
              </Button>
              <Button color="inherit" onClick={() => navigate("/student/my")}>
                My Submissions
              </Button>
              <Button color="inherit" onClick={() => navigate("/coding/my")}>
                My Coding Submissions
              </Button>
            </>
          )}
          <Button color="secondary" variant="contained" onClick={logout} sx={{ ml: 2 }}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
