const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff"
};

function send(res, status, body) {
  res.statusCode = status;
  for (const [name, value] of Object.entries(JSON_HEADERS)) res.setHeader(name, value);
  res.end(JSON.stringify(body));
}

function requiredEnvironment() {
  const url = String(process.env.GOOGLE_APPS_SCRIPT_URL || "").trim();
  const token = String(process.env.GOOGLE_APPS_SCRIPT_ACCESS_KEY || "").trim();
  if (!url || !token) throw new Error("Konfigurasi database produksi belum lengkap.");
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/i.test(url)) {
    throw new Error("Endpoint database produksi tidak valid.");
  }
  return { url, token };
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 5_000_000) throw new Error("Data sinkronisasi terlalu besar.");
  }
  return JSON.parse(raw || "{}");
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return send(res, 405, { ok: false, message: "Metode tidak didukung." });
  }

  try {
    const { url, token } = requiredEnvironment();
    const incoming = req.method === "POST" ? await readBody(req) : ¶»§q«^