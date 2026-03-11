export async function onRequestGet(context) {
  try {
    const { params, env } = context;
    const id = params.id;
    const object = await env.R2_BUCKET.get(`images/${id}`);

    if (!object) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    }

    return new Response(object.body, {
      status: 200,
      headers: { 'Content-Type': object.httpMetadata.contentType }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
