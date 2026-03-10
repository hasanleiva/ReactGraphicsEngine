export async function onRequestPost(context) {
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
    const body = await request.json();
    const { oldPassword, newPassword } = body;

    if (user.password !== oldPassword) {
      return new Response(JSON.stringify({ error: 'Incorrect old password' }), { status: 400 });
    }

    user.password = newPassword;
    await env.USERS_KV.put(`user:${email}`, JSON.stringify(user));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
