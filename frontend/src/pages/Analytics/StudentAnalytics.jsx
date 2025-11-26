import React, { useEffect, useState } from "react";
import { Container, Paper, Typography, Grid, Box, Stack, Chip } from "@mui/material";
import api from "../../api/axiosInstance";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title } from "chart.js";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

export default function StudentAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/student/dashboard")
      .then(res => setData(res.data))
      .catch(() => {});
  }, []);

  if (!data) return <div>Loading...</div>;

  // Subject-wise data
  const labels = data.subjectAnalytics.map(s => s.subject);
  const avgMarks = data.subjectAnalytics.map(s => Number(s.averageMarks));
  const onTimeRate = data.subjectAnalytics.map(s => parseFloat(s.onTimeRate));

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5">Student Analytics</Typography>

        {/* Summary Stats */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {[
            { label: "Total Assignments", value: data.summary.totalAssignments },
            { label: "Submitted", value: data.summary.submitted },
            { label: "Pending", value: data.summary.pending },
            { label: "On Time", value: data.summary.onTime },
            { label: "Late", value: data.summary.late },
            { label: "Average Marks", value: data.summary.averageMarks },
            { label: "Graded Submissions", value: data.summary.feedbackCount },
          ].map((item, i) => (
            <Grid item xs={6} sm={4} key={i}>
              <Box p={2} bgcolor="#f5f5f5" borderRadius={2}>
                <Typography>{item.label}</Typography>
                <Typography fontWeight={600}>{item.value}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Subject-wise Average Marks */}
        <Typography variant="h6" sx={{ mt: 4 }}>
          Subject-wise Average Marks
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Average marks obtained in each subject.
        </Typography>
        <div style={{ height: 300, marginTop: 10 }}>
          <Bar
            data={{
              labels,
              datasets: [
                { label: "Average Marks", data: avgMarks, backgroundColor: "#3f51b5" }
              ]
            }}
            options={{
              responsive: true,
              plugins: { 
                legend: { position: "top" },
                title: { display: true, text: "Average Marks per Subject" }
              },
              scales: {
                y: { beginAtZero: true, title: { display: true, text: "Marks (0-100)" } },
                x: { title: { display: true, text: "Subjects" } }
              }
            }}
          />
        </div>

        {/* Subject-wise On-Time Submission Rate */}
        <Typography variant="h6" sx={{ mt: 4 }}>
          Subject-wise On-Time Submission Rate
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Percentage of submissions turned in on time for each subject.
        </Typography>
        <div style={{ height: 300, marginTop: 10 }}>
          <Bar
            data={{
              labels,
              datasets: [
                { label: "On-Time Submission (%)", data: onTimeRate, backgroundColor: "#4caf50" }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: "On-Time Submission Rate per Subject" }
              },
              scales: {
                y: { beginAtZero: true, max: 100, title: { display: true, text: "Percentage (%)" } },
                x: { title: { display: true, text: "Subjects" } }
              }
            }}
          />
        </div>
      </Paper>
    </Container>
  );
}
