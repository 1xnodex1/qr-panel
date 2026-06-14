import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { data, error } = await supabase
      .from('tokens')
      .select('id, token, label, qr_image_url, used, used_at, expires_at, created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('LIST API ERROR:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ tokens: data || [] })
  } catch (err) {
    console.error('LIST API CATCH ERROR:', err)
    return res.status(500).json({
      error: err.message || 'Internal Server Error',
    })
  }
}