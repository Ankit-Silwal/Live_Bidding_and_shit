
import { pool } from "../../config/db.js";

export interface UpsertUserInput {
  clerkId: string;
  email: string;
  username: string;
  profileImage: string;
}

export async function upsertUser({
  clerkId,
  email,
  username,
  profileImage,
}: UpsertUserInput): Promise<any> {
  const query = `
    INSERT INTO users (clerk_id, email, username, profile_image)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (clerk_id)
    DO UPDATE SET
      email = EXCLUDED.email,
      username = EXCLUDED.username,
      profile_image = EXCLUDED.profile_image,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;

  const values = [clerkId, email, username, profileImage];

  const result = await pool.query(query, values);

  return result.rows[0];
}