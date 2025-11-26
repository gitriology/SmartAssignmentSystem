import React, { useEffect, useState } from "react";
import { Container, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button } from "@mui/material";
import { getAllAssignments } from "../../api/assignments";
import { useNavigate } from "react-router-dom";

export default function AllAssignments() {
  const [items, setItems] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    getAllAssignments().then(res => setItems(res.data)).catch(()=>{});
  }, []);

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5">All Assignments</Typography>
        <Table>
          <TableHead>
            <TableRow><TableCell>#</TableCell><TableCell>Title</TableCell><TableCell>Due</TableCell><TableCell>Actions</TableCell></TableRow>
          </TableHead>
          <TableBody>a
            {items.map((a, i) => (
              <TableRow key={a._id}>
                <TableCell>{i+1}</TableCell>
                <TableCell>{a.title}</TableCell>
                <TableCell>{new Date(a.dueDate).toLocaleDateString()}</TableCell>
                <TableCell><Button onClick={() => nav(`/assignments/${a._id}`)}>View</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
