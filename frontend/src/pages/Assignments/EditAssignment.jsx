import React, { useEffect, useState } from "react";
import { getAssignment, editAssignment } from "../../api/assignments";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
  Box
} from "@mui/material";
import FileUpload from "../../components/FileUpload";
import { AddCircle, RemoveCircle } from "@mui/icons-material";

export default function EditAssignment() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [files, setFiles] = useState([]); // NEW FILES TO UPLOAD
  const [rubric, setRubric] = useState([]);
  const nav = useNavigate();

  // Load assignment
  useEffect(() => {
    getAssignment(id)
      .then((res) => {
        const a = res.data;
        setAssignment(a);

        // Load rubric safely
        setRubric(
          a.rubric?.length
            ? a.rubric.map((r) => ({
                criteria: r.criteria || "",
                marks: r.marks != null && !isNaN(Number(r.marks)) ? Number(r.marks) : 0
              }))
            : [{ criteria: "", marks: 0 }]
        );
      })
      .catch((err) => alert(err.message));
  }, [id]);

  // Rubric handlers
  const updateRubric = (index, field, value) => {
    const updated = [...rubric];
    if (field === "marks") {
      updated[index][field] = value === "" || isNaN(Number(value)) ? 0 : Number(value);
    } else {
      updated[index][field] = value;
    }
    setRubric(updated);
  };

  const addRubricRow = () => {
    setRubric([...rubric, { criteria: "", marks: 0 }]);
  };

  const removeRubricRow = (index) => {
    const updated = rubric.filter((_, i) => i !== index);
    setRubric(updated);
  };

  // Submit
  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData();

    fd.append("title", assignment.title);
    fd.append("description", assignment.description);
    fd.append("dueDate", assignment.dueDate);
    fd.append("status", assignment.status);

    // Rubric: ensure marks are numbers
    fd.append(
      "rubric",
      JSON.stringify(
        rubric.map((r) => ({
          criteria: r.criteria,
          marks: r.marks != null && !isNaN(Number(r.marks)) ? Number(r.marks) : 0
        }))
      )
    );

    // New files
    files.forEach((f) => fd.append("attachments", f));

    try {
      await editAssignment(id, fd);
      alert("Assignment Updated Successfully!");
      nav("/teacher/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  if (!assignment) return <div>Loading...</div>;

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5">Edit Assignment</Typography>

        <form onSubmit={submit}>
          {/* TITLE */}
          <TextField
            fullWidth
            label="Title"
            margin="normal"
            required
            value={assignment.title}
            onChange={(e) =>
              setAssignment({ ...assignment, title: e.target.value })
            }
          />

          {/* DESCRIPTION */}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            margin="normal"
            value={assignment.description}
            onChange={(e) =>
              setAssignment({ ...assignment, description: e.target.value })
            }
          />

          {/* DUE DATE */}
          <TextField
            type="datetime-local"
            fullWidth
            label="Due Date"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={
              assignment.dueDate
                ?  new Date(assignment.dueDate).toLocaleString("sv-SE", { hour12: false }).slice(0, 16)
                : ""
            }
            onChange={(e) =>
              setAssignment({ ...assignment, dueDate: e.target.value })
            }
          />

          {/* Existing Attachments */}
          <Typography variant="h6" sx={{ mt: 3 }}>
            Existing Attachments
          </Typography>

          {assignment.attachments?.length > 0 ? (
            assignment.attachments.map((file, i) => (
              <Box
                key={i}
                sx={{
                  p: 1,
                  mt: 1,
                  border: "1px solid #ccc",
                  borderRadius: 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <Typography>{file.filename}</Typography>
                <Button
                  variant="outlined"
                  onClick={() =>
                    window.open(
                      file.url.startsWith("http")
                        ? file.url
                        : `http://localhost:3000${file.url}`,
                      "_blank"
                    )
                  }
                >
                  View File
                </Button>
              </Box>
            ))
          ) : (
            <Typography>No files uploaded previously.</Typography>
          )}

          {/* Rubric */}
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
                marginTop: "10px"
              }}
            >
              <TextField
                label="Criteria"
                fullWidth
                value={row.criteria}
                onChange={(e) =>
                  updateRubric(index, "criteria", e.target.value)
                }
              />

              <TextField
                label="Max Marks"
                type="number"
                sx={{ width: "120px" }}
                value={row.marks}
                onChange={(e) =>
                  updateRubric(index, "marks", e.target.value)
                }
                inputProps={{ min: 0 }}
              />

              {rubric.length > 1 && (
                <IconButton color="error" onClick={() => removeRubricRow(index)}>
                  <RemoveCircle />
                </IconButton>
              )}
            </div>
          ))}

          <Button
            startIcon={<AddCircle />}
            sx={{ mt: 1 }}
            onClick={addRubricRow}
          >
            Add More Criteria
          </Button>

          {/* Upload New Files */}
          <Typography variant="h6" sx={{ mt: 3 }}>
            Upload New Files (optional)
          </Typography>

          <FileUpload onFiles={(f) => setFiles(f)} />

          <Button variant="contained" type="submit" sx={{ mt: 3 }}>
            Save
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
