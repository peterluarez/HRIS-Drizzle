"use strict";

import bcrypt from "bcrypt";
import db from "../../config/db.js";
import { users } from "../../db/schema.js";
import { eq, count, or, and, ilike, desc } from "drizzle-orm";

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

  findAllPaginated: async (page, limit, search = "", role = "") => {
    const offsetValue = (page - 1) * limit;

    // 1. Create an array of filters
    const filters = [];

    // 2. Add Role filter only if it exists (not null/undefined)
    if (role) {
      filters.push(eq(users.role, role));
    }

    // 3. Add Search filter only if it exists
    if (search) {
      filters.push(
        or(
          ilike(users.fullName, `%${search}%`),
          ilike(users.email, `%${search}%`),
        ),
      );
    }

    // 4. Combine filters using 'and' only if there's more than one
    const finalFilter = filters.length > 0 ? and(...filters) : undefined;

    const data = await db
      .select()
      .from(users)
      .where(finalFilter)
      .orderBy(desc(users.id))
      .limit(limit)
      .offset(offsetValue);

    const totalCountRes = await db
      .select({ value: count() })
      .from(users)
      .where(finalFilter);

    const totalCount = Number(totalCountRes[0].value);

    return {
      meta: {
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
      data,
    };
  }, 
  
  findById: async (uuid) => {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.uuid, uuid))
      .limit(1);

    // Drizzle returns an array, so we return the first item or null
    return result[0] || null;
  },

  updateUser: async (id, data) => {
    // Create a copy so we don't mutate the original request object
    const updateData = { ...data };

    // Handle password hashing if a new one is provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Fetch current user to prevent unique constraint errors on their own email
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (currentUser[0] && updateData.email === currentUser[0].email) {
      // Remove email from the update payload if it's the same as current
      delete updateData.email;
    }

    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    return result[0] || null;
  },

  getDashboardStats: async () => {
    const res = await db
      .select({ value: count() })
      .from(users)
      .where(eq(users.role, "employee"));
    
    return {
      totalEmployees: Number(res[0].value),
    };
  },
};
