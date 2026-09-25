"use server";

import { redirect } from "next/navigation";

import { auth, signIn, signOut } from "@/auth";
import { getAccountConfiguration } from "@/lib/auth/config";
import { deleteUser } from "@/lib/auth/users";
import {
  deleteGoogleCalendarConnection,
  getGoogleCalendarConnection,
} from "@/lib/calendar/connections";

async function revokeGoogleToken(token: string): Promise<void> {
  try {
    await fetch("https://oauth2.googleapis.com/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }),
    });
  } catch {
    // Local deletion must still succeed when Google is temporarily unavailable.
  }
}

export async function startGoogleSignIn() {
  if (!getAccountConfiguration().authReady) redirect("/account?signin=unavailable");
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function disconnectGoogleCalendarAction() {
  const session = await auth();
  if (!session?.user.id) redirect("/account?signin=required");

  const connection = await getGoogleCalendarConnection(session.user.id);
  if (connection) await revokeGoogleToken(connection.refreshToken);
  await deleteGoogleCalendarConnection(session.user.id);
  redirect("/account?calendar=disconnected");
}

export async function deleteAccountAction(formData: FormData) {
  const session = await auth();
  if (!session?.user.id) redirect("/account?signin=required");
  if (formData.get("confirm") !== "delete") {
    redirect("/account?account=confirmation-required");
  }

  const connection = await getGoogleCalendarConnection(session.user.id);
  if (connection) await revokeGoogleToken(connection.refreshToken);
  await deleteUser(session.user.id);
  await signOut({ redirectTo: "/?account=deleted" });
}
