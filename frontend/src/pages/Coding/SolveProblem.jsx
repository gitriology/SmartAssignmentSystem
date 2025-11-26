import React, { useEffect, useState } from "react";
import { getProblem, runCode, submitCode } from "../../api/coding";
import { useParams } from "react-router-dom";
import {
  Container,
  Paper,
  Button,
  Typography,
  MenuItem,
  Select,
  Chip,
  Box,
  Divider,
} from "@mui/material";
import Editor from "@monaco-editor/react";

export default function SolveProblem() {
  const { id } = useParams();

  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("python");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [submitResult, setSubmitResult] = useState(null);

  // Load Problem
  useEffect(() => {
    setLoading(true);
    getProblem(id)
      .then((res) => {
        setProblem(res.data);
        setCode(res.data.starterCode?.[language] || "");
      })
      .catch((err) => setApiError(err.response?.data?.message || "Error loading problem"))
      .finally(() => setLoading(false));
  }, [id, language]);

  // RUN CODE
  const run = async () => {
    try {
      const res = await runCode({ code, language, stdin: "" });
      setOutput(res.data?.stdout || res.data?.stderr || "No output");
    } catch (err) {
      setOutput("Runtime Error: " + (err.response?.data?.message || err.message));
    }
  };

  // SUBMIT CODE
  const submit = async () => {
  try {
    const res = await submitCode(id, { code, language });

    // The backend returns submission inside res.data.submission
    const sub = res.data.submission;

    setSubmitResult({
      passed: sub.passed,
      total: sub.total,
      details: sub.details,
    });

    setOutput("Code submitted! Check testcase results below on submitting"); // keep raw output
  } catch (err) {
    setOutput("Submission Error: " + (err.response?.data?.message || err.message));
  }
};


  if (loading) return <div>Loading...</div>;
  if (apiError) return <div style={{ color: "red" }}>{apiError}</div>;
  if (!problem) return "Problem not found.";

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4">{problem.title}</Typography>

        {/* Language Selection */}
        <Select
          sx={{ mt: 2 }}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <MenuItem value="python">Python</MenuItem>
          <MenuItem value="javascript">JavaScript</MenuItem>
          <MenuItem value="cpp">C++</MenuItem>
          <MenuItem value="c">C</MenuItem>
          <MenuItem value="java">Java</MenuItem>
        </Select>

        {/* Monaco Editor */}
        <Editor
          height="400px"
          theme="vs-dark"
          language={language}         // FIXED: correct way to update language dynamically
          value={code}
          onChange={(v) => setCode(v)}
          options={{ fontSize: 14 }}
          sx={{ mt: 2 }}
        />

        <Button variant="contained" sx={{ mt: 2, mr: 2 }} onClick={run}>
          Run
        </Button>

        <Button variant="outlined" sx={{ mt: 2 }} onClick={submit}>
          Submit
        </Button>

        {/* Raw Output */}
        <Paper sx={{ mt: 2, p: 2 }}>
          <Typography variant="h6">Raw Output</Typography>
          <pre>{output}</pre>
        </Paper>

        {/* Testcase Results */}
        {submitResult && submitResult.details && (
          <Paper sx={{ mt: 3, p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Testcase Results
            </Typography>

            {/* Score Summary */}
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Typography variant="h6">
                Score: {submitResult.passed} / {submitResult.total}
              </Typography>

              {submitResult.passed === submitResult.total ? (
                <Chip label="All Testcases Passed" color="success" />
              ) : (
                <Chip label="Some Testcases Failed" color="error" />
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Testcases */}
            {submitResult.details.map((tc, i) => (
              <Paper
                key={i}
                sx={{
                  p: 2,
                  mb: 2,
                  borderLeft: tc.ok ? "5px solid green" : "5px solid red",
                }}
              >
                <Typography variant="subtitle1">
                  Testcase #{i + 1}{" "}
                  {tc.ok ? (
                    <Chip label="Passed" color="success" size="small" />
                  ) : (
                    <Chip label="Failed" color="error" size="small" />
                  )}
                </Typography>

                <Typography sx={{ mt: 1 }}>
                  <strong>Input:</strong>
                </Typography>
                <pre>{tc.input}</pre>

                <Typography>
                  <strong>Expected Output:</strong>
                </Typography>
                <pre>{tc.expected}</pre>

                <Typography>
                  <strong>Your Output:</strong>
                </Typography>
                <pre>{tc.stdout}</pre>
              </Paper>
            ))}
          </Paper>
        )}
      </Paper>
    </Container>
  );
}
