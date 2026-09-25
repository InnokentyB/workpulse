import { queryDatabase } from "@/lib/db";

export type WorkPulseUser = {
  id: string;
  email: string;
  name: string | null;
};

type UserRow = {
  id: string;
  email: string;
  name: string | null;
};

export async function upsertGoogleUser(input: {
  googleSubject: string;
  email: string;
  name?: string | null;
}): Promise<WorkPulseUser> {
  const [row] = await queryDatabase<UserRow>(
    `INSERT INTO workpulse_user (google_subject, email, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (google_subject) DO UPDATE SET
       email = EXCLUDED.email,
       name = EXCLUDED.name,
       updated_at = NOW()
     RETURNING id, email, name`,
    [input.googleSubject, input.email, input.name ?? null],
  );

  if (!row) throw new Error("Could not create the WorkPulse user.");
  return { id: row.id, email: row.email, name: row.name };
}

export async function deleteUser(userId: string): Promise<void> {
  await queryDatabase("DELETE FROM workpulse_user WHERE id = $1", [userId]);
}
