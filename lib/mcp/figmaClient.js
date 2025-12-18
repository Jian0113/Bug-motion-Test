export async function pingFigmaMcp() {
  try {
    const res = await fetch("/api/mcp/figma/ping");
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const data = await res.json().catch(() => ({}));
    return data;
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
}

