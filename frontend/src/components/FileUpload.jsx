import React from "react";
import { Button, Box } from "@mui/material";

export default function FileUpload({ onFiles }) {
  return (
    <Box>
      <input
        id="file-upload"
        type="file"
        multiple
        style={{ display: "none" }}
        onChange={(e) => onFiles(Array.from(e.target.files))}
      />
      <label htmlFor="file-upload">
        <Button variant="outlined" component="span">Choose files</Button>
      </label>
    </Box>
  );
}
