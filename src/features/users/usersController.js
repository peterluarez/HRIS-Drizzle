"use strict";

import { usersService } from "./usersService.js";

export const createUser = async (req, res) => {
  try {
    const { email } = req.body;

    const existingUser = await usersService.findByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        result: {
          success: false,
          error: "Email already in use",
          message: `The email address is already registered.`,
          date: new Date().toISOString(),
        },
      });
    }

    const newUser = await usersService.create(req.body);

    return res.status(201).json({
      result: {
        success: true,
        message: "User created successfully!",
        data: {
          userId: newUser.id,
          createdAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);

    // Fallback for unexpected errors (DB down, syntax errors, etc.)
    return res.status(500).json({
      result: {
        success: false,
        message: "Internal Server Error",
        error: error.message,
      },
    });
  }
};