/**
 * Vercel serverless function — saves contact inquiries to Supabase.
 * Requires env vars in Vercel: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, service, message } = req.body ?? {};

  if (!name || !email || !service || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(503).json({
      error: 'Server not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.',
    });
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/contact_inquiries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ name, email, service, message }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('Supabase error:', detail);
    return res.status(500).json({ error: 'Failed to save inquiry' });
  }

  return res.status(200).json({ ok: true });
}
