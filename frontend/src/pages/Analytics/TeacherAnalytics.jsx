import React, { useEffect, useState } from "react";
import { Container, Paper, Typography, Grid, Box, Chip, Stack } from "@mui/material";
import api from "../../api/axiosInstance";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title } from "chart.js";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

export default function TeacherAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/teacher/dashboard")
      .then(res => setData(res.data))
      .catch(() => {});
  }, []);

  if (!data) return <div>Loading...</div>;

  const labels = data.assignments.map(a => a.title);
  const avgMarks = data.assignments.map(a => Number(a.averageMarks) || 0);
  const graded = data.assignments.map(a => a.graded);
  const pending = data.assignments.map(a => a.pending);
  const late = data.assignments.map(a => a.late);

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5">Teacher Analytics</Typography>

        {/* Summary Stats */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {[
            { label: "Total Assignments", value: data.summary.totalAssignments },
            { label: "Total Submissions", value: data.summary.totalSubmissions },
            { label: "Total Graded", value: data.summary.totalGraded },
            { label: "Total Pending", value: data.summary.totalPending },
            { label: "Total Late", value: data.summary.totalLate },
            { label: "Average Marks", value: data.summary.averageMarks },
          ].map((item, i) => (
            <Grid item xs={6} sm={4} key={i}>
              <Box p={2} bgcolor="#f5f5f5" borderRadius={2}>
                <Typography>{item.label}</Typography>
                <Typography fontWeight={600}>{item.value}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Assignment-wise Average Marks */}
        <Typography variant="h6" sx={{ mt: 4 }}>
          Assignment-wise Average Marks
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          This chart shows the average marks obtained by students for each assignment.
        </Typography>
        <div style={{ height: 300, marginTop: 10 }}>
          <Bar
            data={{
              labels,
              datasets: [
                {
                  label: "Average Marks",
                  data: avgMarks,
                  backgroundColor: "#3f51b5",
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Average Marks per Assignment" },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: { display: true, text: "Marks (0-100)" },
                },
                x: { title: { display: true, text: "Assignments" } },
              },
            }}
          />
        </div>

        {/* Assignment-wise Submission Status */}
        <Typography variant="h6" sx={{ mt: 4 }}>
          Assignment-wise Submission Status
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          This stacked bar chart shows the number of submissions that are graded, pending, or submitted late for each assignment.
        </Typography>
        <div style={{ height: 300, marginTop: 10 }}>
          <Bar
            data={{
              labels,
              datasets: [
                { label: "Graded", data: graded, backgroundColor: "#4caf50" },
                { label: "Pending", data: pending, backgroundColor: "#ff9800" },
                { label: "Late", data: late, backgroundColor: "#f44336" },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Submission Status per Assignment" },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: { display: true, text: "Number of Submissions" },
                },
                x: { title: { display: true, text: "Assignments" } },
              },
            }}
          />
        </div>

        {/* Grade Distribution and Top Students per Assignment */}
        {data.assignments.map((a, i) => (
          <Box
            key={i}
            sx={{
              mt: 4,
              p: 2,
              border: "1px solid #ddd",
              borderRadius: 2,
              bgcolor: "#fafafa",
            }}
          >
            <Typography variant="h6">{a.title}</Typography>
            <Stack direction="row" spacing={1} sx={{ my: 1 }}>
              <Chip label={`Graded: ${a.graded}`} color="success" size="small" />
              <Chip label={`Pending: ${a.pending}`} color="warning" size="small" />
              <Chip label={`Late: ${a.late}`} color="error" size="small" />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Grade Distribution: 0-50, 51-70, 71-85, 86-100 shows how student scores are spread.
            </Typography>
            <Typography>
              0-50: {a.gradeDistribution["0-50"]} | 51-70: {a.gradeDistribution["51-70"]} | 71-85: {a.gradeDistribution["71-85"]} | 86-100: {a.gradeDistribution["86-100"]}
            </Typography>

            {/* Top Students */}
            {a.topStudents?.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Top Students:</Typography>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {a.topStudents.map((s, index) => (
                    <li key={index}>
                      {s.name}  - {s.marks} marks
                    </li>
                  ))}
                </ul>
              </Box>
            )}
          </Box>
        ))}
      </Paper>
    </Container>
  );
}
