// apps/frontend/src/api/api.ts

export async function apiFetch(
  url: string,
  options?: RequestInit & { skipJson?: boolean },
) {
  const res = await fetch(url, {
    credentials: "include",
    ...options,
  });
  if (options?.skipJson) return res;
  let data;
  try {
    data = await res.json();
  } catch {
    data = undefined;
  }
  if (!res.ok) {
    const error = (data && data.error) || res.statusText || "API error";
    throw new Error(error);
  }
  return data;
}
