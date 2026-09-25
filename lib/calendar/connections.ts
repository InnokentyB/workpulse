import {
  decryptCalendarToken,
  encryptCalendarToken,
} from "@/lib/auth/token-crypto";
import { queryDatabase } from "@/lib/db";

export type StoredCalendarConnection = {
  provider: "google";
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  scope: string;
  connectedAt: string;
};

type CalendarConnectionRow = {
  provider: "google";
  encrypted_access_token: string;
  encrypted_refresh_token: string;
  access_token_expires_at: Date;
  scope: string;
  connected_at: Date;
};

type CalendarConnectionStatusRow = {
  connected_at: Date;
  status: "connected" | "reauthorization-required";
};

function encryptionKey(): string {
  const key = process.env.CALENDAR_TOKEN_ENCRYPTION_KEY?.trim();
  if (!key) throw new Error("CALENDAR_TOKEN_ENCRYPTION_KEY is not configured.");
  return key;
}

export async function saveGoogleCalendarConnection(
  userId: string,
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    scope: string;
  },
): Promise<void> {
  const key = encryptionKey();
  await queryDatabase(
    `INSERT INTO calendar_connection (
       user_id, provider, encrypted_access_token, encrypted_refresh_token,
       access_token_expires_at, scope, status
     ) VALUES ($1, 'google', $2, $3, $4, $5, 'connected')
     ON CONFLICT (user_id, provider) DO UPDATE SET
       encrypted_access_token = EXCLUDED.encrypted_access_token,
       encrypted_refresh_token = EXCLUDED.encrypted_refresh_token,
       access_token_expires_at = EXCLUDED.access_token_expires_at,
       scope = EXCLUDED.scope,
       status = 'connected',
       updated_at = NOW()`,
    [
      userId,
      encryptCalendarToken(tokens.accessToken, key),
      encryptCalendarToken(tokens.refreshToken, key),
      tokens.expiresAt,
      tokens.scope,
    ],
  );
}

export async function getGoogleCalendarConnection(
  userId: string,
): Promise<StoredCalendarConnection | null> {
  const [row] = await queryDatabase<CalendarConnectionRow>(
    `SELECT provider, encrypted_access_token, encrypted_refresh_token,
            access_token_expires_at, scope, connected_at
     FROM calendar_connection
     WHERE user_id = $1 AND provider = 'google' AND status = 'connected'`,
    [userId],
  );
  if (!row) return null;

  const key = encryptionKey();
  return {
    provider: row.provider,
    accessToken: decryptCalendarToken(row.encrypted_access_token, key),
    refreshToken: decryptCalendarToken(row.encrypted_refresh_token, key),
    expiresAt: row.access_token_expires_at.toISOString(),
    scope: row.scope,
    connectedAt: row.connected_at.toISOString(),
  };
}

export async function deleteGoogleCalendarConnection(
  userId: string,
): Promise<void> {
  await queryDatabase(
    "DELETE FROM calendar_connection WHERE user_id = $1 AND provider = 'google'",
    [userId],
  );
}

export async function getGoogleCalendarConnectionStatus(
  userId: string,
): Promise<CalendarConnectionStatusRow | null> {
  const [row] = await queryDatabase<CalendarConnectionStatusRow>(
    `SELECT connected_at, status
     FROM calendar_connection
     WHERE user_id = $1 AND provider = 'google'`,
    [userId],
  );
  return row ?? null;
}
