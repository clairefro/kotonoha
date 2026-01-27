import bcrypt from "bcrypt";

import { createClient } from "@libsql/client";
import { nanoid } from "nanoid";

import {
  ItemId,
  HumanId,
  TagId,
  CommentId,
  ActivityId,
  UserId,
} from "shared-types";

/** SCHEMA ENFORCEMENT */
export async function ensureDbSchema(
  db: ReturnType<typeof createClient>,
  schema: string,
) {
  // Remove block comments (/* ... */)
  schema = schema.replace(/\/\*[\s\S]*?\*\//g, "");
  // Remove line comments (lines starting with --)
  schema = schema.replace(/^\s*--.*$/gm, "");
  // Remove inline comments ( -- ... )
  schema = schema.replace(/--[^\n]*/g, "");

  // Group lines into full SQL statements
  const statements: string[] = [];
  let lines = schema.split(/\r?\n/);
  let buffer: string[] = [];
  let inTrigger = false;
  let inTable = false;
  for (let line of lines) {
    if (!inTrigger && /CREATE\s+TRIGGER/i.test(line)) {
      inTrigger = true;
      buffer.push(line);
      continue;
    }
    if (inTrigger) {
      buffer.push(line);
      if (/END\s*;?/i.test(line)) {
        statements.push(buffer.join("\n"));
        buffer = [];
        inTrigger = false;
      }
      continue;
    }
    if (!inTable && /CREATE\s+TABLE/i.test(line)) {
      inTable = true;
      buffer.push(line);
      continue;
    }
    if (inTable) {
      buffer.push(line);
      if (/^\)\s*;?\s*$/.test(line)) {
        statements.push(buffer.join("\n"));
        buffer = [];
        inTable = false;
      }
      continue;
    }
    // For other lines, split on semicolons
    let parts = line.split(";");
    for (let part of parts) {
      if (part.trim()) {
        statements.push(part.trim());
      }
    }
  }

  for (const stmt of statements) {
    // Skip lone END
    if (stmt.toUpperCase() === "END") continue;
    await db.execute(stmt);
  }
}

/** DB ENTITY UTILS */

const newNanoId = () => {
  return nanoid(14);
};

export const createId = {
  user: () => `u_${newNanoId()}` as UserId,
  item: () => `i_${newNanoId()}` as ItemId,
  human: () => `h_${newNanoId()}` as HumanId,
  topic: () => `t_${newNanoId()}` as TagId,
  comment: () => `c_${newNanoId()}` as CommentId,
  activity: () => `a_${newNanoId()}` as ActivityId,
};

/** HASHING UTILS */

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10); // 10 salt rounds
};

export const verifyPassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
