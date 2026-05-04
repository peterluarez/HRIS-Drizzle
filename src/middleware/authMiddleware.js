"use strict";

import jwt from "jsonwebtoken";

export const verifyApp = (req, res, next) => {
  try {
    let _clientid = process.env.APP_CLIENT_ID;
    let _clientSecret = process.env.APP_CLIENT_SECRET;

    let clientID = req.headers["client-id"];
    let clientSecret = req.headers["client-secret"];

    if (!clientID)
      return res.status(401).json({
        result: { message: "Client Id is missing." },
      });
    if (!clientSecret)
      return res.status(401).json({
        result: { message: "Client Secret is missing" },
      });
    if (_clientid !== clientID)
      return res.status(401).json({
        result: { message: "Invalid Client Id" },
      });
    if (_clientSecret !== clientSecret)
      return res.status(401).json({
        result: { message: "Invalid Client Secret" },
      });
    next();
  } catch (error) {
    return res.status(403).json({
      response: {
        success: false,
        message: "Invalid or App ID or SECRET",
      },
    });
  }
};

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      response: {
        success: false,
        message: "Access Denied: No token provided",
      },
    });
  }

  try {
    const verified = jwt.verify(token, process.env.APP_CLIENT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    return res.status(403).json({
      response: {
        success: false,
        message: "Invalid or expired token",
      },
    });
  }
};
