export async function onRequestGet(context) {
  try {
    const { env } = context;
    const list = await env.R2_BUCKET.list({ prefix: 'templates/' });
    const templates = list.objects.map(obj => obj.key.replace('templates/', '').replace('.json', ''));

    return new Response(JSON.stringify({ success: true, templates }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
