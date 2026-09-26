/**
 * Visitor counter backed by Upstash Redis over REST. Works with the env vars
 * the Vercel Marketplace integration injects (either naming scheme). When
 * nothing is configured every call returns null and the sticker stays hidden.
 */
const URL = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const KEY = "mruud:visits";

export const visitsConfigured = Boolean(URL && TOKEN);

async function command(...parts: string[]): Promise<number | null> {
  if (!URL || !TOKEN) return null;
  try {
    const res = await fetch(`${URL}/${parts.map(encodeURIComponent).join("/")}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: number | string };
    return typeof data.result === "number" ? data.result : Number(data.result ?? NaN) || null;
  } catch {
    return null;
  }
}

export const incrementVisits = () => command("incr", KEY);
export const getVisits = () => command("get", KEY);
