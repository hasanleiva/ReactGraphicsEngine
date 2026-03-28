export async function onRequestGet(context) {
  const { request, env, params } = context;
  const filename = params.filename;

  if (!filename) {
    return new Response('Filename is required', { status: 400 });
  }

  try {
    const object = await env.R2_BUCKET.get(filename);

    if (object === null) {
      return new Response('File not found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('content-type', 'application/json');

    return new Response(object.body, {
      headers,
    });
  } catch (error) {
    return new Response(`Error fetching file: ${error.message}`, { status: 500 });
  }
}
