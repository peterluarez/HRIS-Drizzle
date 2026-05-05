"use strict";

import bcrypt from "bcrypt";
import db from "../../config/db.js";
import { users } from "../../db/schema.js";
import { eq, count, or, ilike, desc } from "drizzle-orm";

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

  findAllPaginated: async (page, limit, search = "") => {
    const offsetValue = (page - 1) * limit;

    const searchFilter = search 
      ? or(
          ilike(users.fullName, `%${search}%`),
          ilike(users.email, `%${search}%`)
        )
      : undefined;

    const data = await db.select()
      .from(users)
      .where(searchFilter) 
      .orderBy(desc(users.id)) 
      .limit(limit)
      .offset(offsetValue);

    const totalCountRes = await db.select({ value: count() })
      .from(users)
      .where(searchFilter);
    
    const totalCount = Number(totalCountRes[0].value);

    return {
      meta: {
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        itemsPerPage: limit
      },
      data
    };
  },
 
  findById: async (id) => {
    const result = await db.select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    // Drizzle returns an array, so we return the first item or null
    return result[0] || null;
  },
};