export default async function handler(req, res) {
  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ ok: false, error: "Missing asset id" });
  }
  const upstream = `https://www.figma.com/api/mcp/asset/${encodeURIComponent(id)}`;
  try {
    const resp = await fetch(upstream);
    if (!resp.ok) {
      return res.status(resp.status).json({ ok: false, error: `Upstream ${resp.status}` });
    }
    const contentType = resp.headers.get("content-type") || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    // short cache to avoid re-fetch spam during dev
    res.setHeader("Cache-Control", "public, max-age=60");
    const arrayBuffer = await resp.arrayBuffer();
    res.status(200).send(Buffer.from(arrayBuffer));
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}

