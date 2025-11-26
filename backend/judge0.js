// backend/services/judge0.js
const axios = require("axios");

const instance = axios.create({
  baseURL: process.env.JUDGE0_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
    "X-RapidAPI-Host": process.env.RAPIDAPI_HOST
  }
});

async function runCode({ source_code, language_id, stdin = "" }) {
  const res = await instance.post(
    "/submissions?base64_encoded=false&wait=true",
    {
      source_code,
      language_id,
      stdin
    }
  );
  return res.data;
}

module.exports = { runCode };
