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
    const incoming = req.method === "POST" ? await readBody(req) : {};
    const action = req.method === "GET" ? String(req.query?.action || "ping") : String(incoming.action || "sync");
    const payload = { ...incoming, action: "sync", token };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25_000);
    let upstream;
    try {
      if (action === "ping") {
        const pingUrl = new URL(url);
        pingUrl.searchParams.set("action", "ping");
        pingUrl.searchParams.set("token", token);
        upstream = await fetch(pingUrl, { method: "GET", redirect: "follow", signal: controller.signal });
      } else {
        upstream = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          redirect: "follow",
          body: JSON.stringify(payload),
          signal: controller.signal
        });
      }
    } finally {
      clearTimeout(timer);
    }

    const text = await upstream.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch (_) {
      throw new Error("Respons database tidak dapat dibaca.");
    }
    if (!upstream.ok) return send(res, 502, { ok: false, message: `Database menjawab HTTP ${upstream.status}.` });
    return send(res, result?.ok === false ? 502 : 200, result);
  } catch (error) {
    const message = error?.name === "AbortError" ? "Koneksi database melewati batas waktu." : (error?.message || "Koneksi database gagal.");
    return send(res, 500, { ok: false, message });
  }
};
