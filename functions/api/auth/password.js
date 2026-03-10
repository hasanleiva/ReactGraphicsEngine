import bcrypt from 'bcryptjs';

export async function onRequestPost(context) {
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

    const body = await request.json();
    const { oldPassword, newPassword } = body;

    if (!(await bcrypt.compare(oldPassword, user.password_hash))) {
      return new Response(JSON.stringify({ error: 'Incorrect old password' }), { status: 400 });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await env.DB.prepare("UPDATE users SET password_hash = ? WHERE email = ?").bind(newPasswordHash, email).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
