"use strict";

import express from "express";
import userRoutes from "../features/users/usersRoutes.js";

const router = express.Router();

router.use("/users", userRoutes);

export default router;