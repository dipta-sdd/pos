import "server-only";
import { cookies } from "next/headers";

import { User } from "./types/auth";

const BACKEND_URL = "http://localhost:8000/api";

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  return token;
}

export async function getUser(): Promise<User | null> {
  const token = await getSession();

  if (!token) return null;

  try {
    const response = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      // Important for Next.js to not cache this indefinitely if you want it to be dynamic
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to fetch user:", error);

    return null;
  }
}
