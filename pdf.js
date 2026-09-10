const UPSTREAM_PDF_ENDPOINT =
  'https://e-perangkat-online-a-oi4bquaqk-harryindrah3-6239s-projects.vercel.app/api/pdf';

function copyHeader(upstream, response, name) {
  const value = upstream.headers.get(name);
  if (value) response.setHeader(name, value);
}

module.exports = async function handler(request, response) {
  if (request.method === 'OPTIONS') {
    response.setHeader('Allow', 'POST, OPTIONS');
    return response.status(204).end();
  }

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST, OPTIONS');
    return response.status(405).json({ error: 'Gunakan metode POST untuk membuat PDF.' });
  }

  try {
    const payload =
      typeof request.body === 'string' ? request.body : JSON.stringify(request.body ?? {});

    const upstream = await fetch(UPSTREAM_PDF_ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/pdf, application/json'
      },
      body: payload,
      signal: AbortSignal.timeout(295_000)
    });

    copyHeader(upstream, response, 'content-type');
    copyHeader(upstream, response, 'content-disposition');
    copyHeader(upstream, response, 'cache-control');
    response.setHeader('x-eperangkat-pdf-parity', 'manual-print-payload-v1');

    const body = Buffer.from(await upstream.arrayBuffer());
    return response.status(upstream.status).send(body);
  } catch (error) {
    const timedOut = error?.name === 'TimeoutError' || error?.name === 'AbortError';
    return response.status(timedOut ? 504 : 502).json({
      error: timedOut
        ? 'Generator PDF melewati batas waktu. Silakan ulangi proses batch.'
        : 'Generator PDF sementara tidak dapat dihubungi.'
    });
  }
};
