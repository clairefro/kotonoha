// apps/frontend/src/api/users.ts

export async function checkUsersEmpty(): Promise<boolean> {
  const res = await fetch("/api/users/empty", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to check users table");
  const data = await res.json();
  return !!data.empty;
}
