"use strict";

import "dotenv/config";
import express from "express";
import db from "./config/db.js";
import mainRouter from "./routes/index.js";

const app = express();
app.use(express.json());

app.use("/hris/api/v1", mainRouter);

const PORT = process.env.APP_PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

export default app;