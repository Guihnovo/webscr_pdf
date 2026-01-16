export async function customRequest(req) {
  const url = new URL(req.url, 'http://localhost');
  req.query = url.searchParams;
  req.pathname = url.pathname;

  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    req.body = null;
    return req;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString('utf-8');

  if (req.headers['content-type'] === 'application/json') {
    req.body = JSON.parse(body);
  } else {
    req.body = body;
  }

  return req;
}
