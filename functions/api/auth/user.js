export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const cookie = request.headers.get('Cookie') || '';
    const match = cookie.match(/auth_token=([^;]+)/);

    if (!match) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
    }

    const token = match[1];
    const session = await env.DB.prepare("SELECT email FROM sessions WHERE token = ?").bind(token).first();

    if (!session) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 });
    }

    const email = session.email;
    const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 401 });
    }

    return new Response(JSON.stringify({ success: true, user: { email: user.email, name: user.name } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
