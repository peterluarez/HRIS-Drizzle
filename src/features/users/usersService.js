"use strict";

import bcrypt from "bcrypt";
import db from "../../config/db.js";
import { users } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export const usersService = {
  findByEmail: async (email) => {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  },

  create: async (data) => {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const userToSave = {
      ...data,
      password: hashedPassword,
    };
    const result = await db.insert(users).values(userToSave).returning();
    return result[0];
  },
};