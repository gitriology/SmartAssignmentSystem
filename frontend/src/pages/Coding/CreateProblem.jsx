import React, { useState } from "react";
import { createProblem } from "../../api/coding";
import { Container, Paper, TextField, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function CreateProblem() {
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [testCases, setTestCases] = useState([{ input: "", output: "" }]);

  const updateTest = (i, f, v) => {
    const arr = [...testCases];
    arr[i][f] = v;
    setTestCases(arr);
  };

  const submit = async () => {
    await createProblem({ title, description, testCases });
    nav("/coding/problems");
  };

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5">Create Coding Problem</Typography>

        <TextField fullWidth label="Title" sx={{ mt: 2 }}
          value={title} onChange={e => setTitle(e.target.value)} />

        <TextField fullWidth label="Description" multiline rows={4} sx={{ mt: 2 }}
          value={description} onChange={e => setDescription(e.target.value)} />

        <Typography variant="h6" sx={{ mt: 2 }}>Test Cases</Typography>
        {testCases.map((tc, i) => (
          <Paper key={i} sx={{ p: 2, mt: 1 }}>
            <TextField label="Input" fullWidth sx={{ mt: 1 }}
              value={tc.input} onChange={e => updateTest(i, "input", e.target.value)} />

            <TextField label="Output" fullWidth sx={{ mt: 1 }}
              value={tc.output} onChange={e => updateTest(i, "output", e.target.value)} />
          </Paper>
        ))}

        <Button sx={{ mt: 2 }} onClick={() => setTestCases([...testCases, { input: "", output: "" }])}>
          Add Test Case
        </Button>

        <Button variant="contained" sx={{ mt: 2 }} onClick={submit}>
          Submit
        </Button>
      </Paper>
    </Container>
  );
}
