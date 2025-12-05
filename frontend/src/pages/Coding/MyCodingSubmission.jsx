import React, { useEffect, useState } from "react";
import { getMyCodingSubmissions } from "../../api/coding";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function MyCodingSubmissions() {
  const [subs, setSubs] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    getMyCodingSubmissions().then((res) => setSubs(res.data));
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4">My Coding Submissions</Typography>

        <Table sx={{ mt: 3 }}>
          <TableHead>
            <TableRow>
              <TableCell>Problem</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Language</TableCell>
              <TableCell>Submitted At</TableCell>
              <TableCell>View</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {subs.length > 0 ? (
              subs.map((s) => (
                <TableRow key={s._id}>
                  <TableCell>{s.problem?.title || "Problem"}</TableCell>

                  <TableCell>
                    {s.passed}/{s.total}
                  </TableCell>

                  <TableCell>{s.language}</TableCell>

                  <TableCell>
                    {new Date(s.createdAt).toLocaleString("en-GB")}
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="outlined"
                      onClick={() => nav(`/coding/submission/${s._id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No submissions yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
