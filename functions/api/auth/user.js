export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const cookie = request.headers.get('Cookie') || '';
    const match = cookie.match(/auth_token=([^;]+)/);

    if (!match) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
    }

    const token = match[1];
    const email = await env.USERS_KV.get(`session:${token}`);

    if (!email) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 });
    }

    const userStr = await env.USERS_KV.get(`user:${email}`);
    if (!userStr) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 401 });
    }

    const user = JSON.parse(userStr);

    return new Response(JSON.stringify({ success: true, user: { email: user.email, name: user.name } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
