// src/pages/Assignments/CreateAssignment.jsx
import React, { useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import { AddCircle, RemoveCircle } from "@mui/icons-material";
import FileUpload from "../../components/FileUpload"; // expects to return File[] via onFiles
import { createAssignment } from "../../api/assignments";
import { useNavigate } from "react-router-dom";

export default function CreateAssignment() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  // Rubric entries: we use { criteria, marks } as per Option B
  const [rubric, setRubric] = useState([{ criteria: "", marks: "" }]);

  // Files chosen by user (File objects)
  const [files, setFiles] = useState([]);
  const nav = useNavigate();

  // Add new rubric row
  const addRubricRow = () => {
    setRubric([...rubric, { criteria: "", marks: "" }]);
  };

  // Remove row
  const removeRubricRow = (index) => {
    const updated = rubric.filter((_, i) => i !== index);
    setRubric(updated);
  };

  // Update a row
  const updateRubric = (index, field, value) => {
    const updated = [...rubric];
    updated[index][field] = value;
    setRubric(updated);
  };

  // Submit
  const submit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.title) return alert("Enter title");
    if (!form.dueDate) return alert("Select due date");

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("dueDate", form.dueDate);

    // Send rubric exactly as array of {criteria, marks}
    // convert marks to number on backend; but we send current state
    fd.append("rubric", JSON.stringify(rubric));

    // Append files under key 'attachments' (backend expects this name)
    files.forEach((f) => fd.append("attachments", f));

    try {
      const res = await createAssignment(fd);
      alert("Assignment created!");
      // Optionally navigate to created assignment details:
      // const newId = res.data.data._id;
      // nav(`/assignments/${newId}`);
      nav("/teacher/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Create failed");
    }
  };

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5">Create Assignment</Typography>

        <form onSubmit={submit}>
          {/* Title */}
          <TextField
            fullWidth
            label="Title"
            required
            margin="normal"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          {/* Description */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            margin="normal"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {/* Due Date */}
          <TextField
            type="datetime-local"
            fullWidth
            label="Due Date"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />

          {/* Rubric Section */}
          <Typography variant="h6" sx={{ mt: 3 }}>
            Rubric
          </Typography>

          {rubric.map((row, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              <TextField
                label="Criteria"
                fullWidth
                value={row.criteria}
                onChange={(e) => updateRubric(index, "criteria", e.target.value)}
              />
              <TextField
                label="Marks"
                type="number"
                sx={{ width: "120px" }}
                value={row.marks}
                onChange={(e) => updateRubric(index, "marks", e.target.value)}
                inputProps={{ min: 0 }}
              />

              {rubric.length > 1 && (
                <IconButton color="error" onClick={() => removeRubricRow(index)}>
                  <RemoveCircle />
                </IconButton>
              )}
            </div>
          ))}

          <Button startIcon={<AddCircle />} sx={{ mt: 1 }} onClick={addRubricRow}>
            Add More Criteria
          </Button>

          {/* File uploader component:
              - Ensure your FileUpload component calls onFiles(filesArray) with File[].
              - We append those files to FormData under the 'attachments' key to match backend.
          */}
          <Typography variant="subtitle1" sx={{ mt: 3 }}>
            Upload Attachments
          </Typography>

          <FileUpload onFiles={(files) => setFiles(files)} />


          {files.length > 0 && (
  <div style={{ marginTop: "10px" }}>
    <Typography variant="subtitle2">Files Selected:</Typography>
    <ul>
      {files.map((file, i) => (
        <li key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {file.name} — {(file.size / 1024).toFixed(1)} KB
          <Button
            variant="outlined"
            size="small"
            onClick={() => window.open(URL.createObjectURL(file), "_blank")}
          >
            View File
          </Button>
        </li>
      ))}
    </ul>
  </div>
)}


          <Button variant="contained" type="submit" sx={{ mt: 2 }}>
            Create Assignment
          </Button>

          <Button
            variant="outlined"
            sx={{ mt: 2, ml: 2 }}
            onClick={() => nav("/teacher/dashboard")}
          >
            Cancel
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
