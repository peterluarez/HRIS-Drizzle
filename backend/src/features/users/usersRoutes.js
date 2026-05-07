"use strict";

import express from "express";
import { signIn, createUser, getUserById, getAllUsers, updateUserById, getDashboardStats } from "./usersController.js";
import { verifyApp, verifyToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signIn", signIn);
router.post("/", verifyApp, verifyToken, createUser);
router.get("/", verifyApp, verifyToken, getAllUsers);
router.get("/stats", verifyApp, verifyToken, getDashboardStats);
router.get("/:id", verifyApp, verifyToken, getUserById); 
router.put("/:id", verifyApp, verifyToken, updateUserById);

export default router;