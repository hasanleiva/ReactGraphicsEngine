export async function onRequestGet(context) {
  try {
    const { params, env } = context;
    const id = params.id;
    const object = await env.R2_BUCKET.get(`templates/${id}.json`);

    if (!object) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    }

    const content = await object.json();
    return new Response(JSON.stringify({ success: true, content }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
