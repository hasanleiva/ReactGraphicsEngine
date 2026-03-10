export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const cookie = request.headers.get('Cookie') || '';
    const match = cookie.match(/auth_token=([^;]+)/);

    if (match) {
      const token = match[1];
      await env.USERS_KV.delete(`session:${token}`);
    }

    const headers = new Headers();
    headers.set('Set-Cookie', `auth_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
    headers.set('Content-Type', 'application/json');

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
