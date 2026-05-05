"use strict";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { usersService } from "./usersService.js";

export const createUser = async (req, res) => {
  try {
    const { email } = req.body;

    const existingUser = await usersService.findByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        response: {
          success: false,
          error: "Email already in use",
          message: `The email address is already registered.`,
        },
      });
    }

    const newUser = await usersService.create(req.body);

    return res.status(201).json({
      response: {
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
    return res.status(500).json({
      response: {
        success: false,
        message: "Internal Server Error",
        error: error.message,
      },
    });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await usersService.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        response: {
          success: false,
          message: "Invalid email or password",
        },
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        response: {
          success: false,
          message: "Invalid email or password",
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.APP_CLIENT_SECRET,
      { expiresIn: "1h" },
    );

    return res.status(200).json({
      response: {
        success: true,
        message: "Login successful",
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
          },
        },
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      response: {
        success: false,
        message: "Internal Server Error",
        error: error.message,
      },
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await usersService.findAllPaginated(page, limit, search);

    return res.status(200).json({
      response: {
        success: true,
        message: "Users retrieved successfully",
        result: result,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      response: {
        success: false,
        message: "Internal Server Error",
        error: error.message,
      },
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate UUID format to prevent Postgres syntax errors
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(id)) {
      return res.status(404).json({
        response: {
          success: false,
          error: "User not found",
          message: "The provided ID is invalid or not existing.",
        },
      });
    }

    // 2. Call the modular service
    const user = await usersService.findById(id);

    if (!user) {
      return res.status(404).json({
        response: {
          success: false,
          error: "User not found",
          message: "The provided ID is invalid or not existing.",
        },
      });
    }

    // 3. Remove sensitive data before responding
    const { password, ...userData } = user;

    return res.status(200).json({
      response: {
        success: true,
        message: "User details retrieved successfully",
        result: userData,
      },
    });
  } catch (error) {
    console.error("Get User Error:", error);
    return res.status(500).json({
      response: {
        success: false,
        message: "Internal Server Error",
        error: error.message,
      },
    });
  }
};
