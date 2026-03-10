export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), { status: 400 });
    }

    const existingUser = await env.USERS_KV.get(`user:${email}`);
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'User already exists' }), { status: 400 });
    }

    const user = { email, password, name };
    await env.USERS_KV.put(`user:${email}`, JSON.stringify(user));

    const token = `tok_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    await env.USERS_KV.put(`session:${token}`, email, { expirationTtl: 60 * 60 * 24 * 7 }); // 7 days

    const headers = new Headers();
    headers.set('Set-Cookie', `auth_token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax`);
    headers.set('Content-Type', 'application/json');

    return new Response(JSON.stringify({ success: true, user: { email, name } }), {
      status: 200,
      headers
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
