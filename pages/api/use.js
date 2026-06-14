import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { token, action = 'preview' } = req.body

    if (!token) {
      return res.status(400).json({ error: 'Token gerekli' })
    }

    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('token', token)
      .single()

    if (error || !data) {
      return res.status(404).json({ status: 'not_found' })
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return res.status(200).json({
        status: 'expired',
        label: data.label,
        qr_image_url: data.qr_image_url || null,
      })
    }

    if (data.used) {
      return res.status(200).json({
        status: 'used',
        used_at: data.used_at,
        label: data.label,
        qr_image_url: data.qr_image_url || null,
      })
    }

    if (action === 'preview') {
      return res.status(200).json({
        status: 'ready',
        target_url: data.target_url,
        label: data.label,
        qr_image_url: data.qr_image_url || null,
      })
    }

    if (action === 'consume') {
      const { data: updated, error: updateError } = await supabase
        .from('tokens')
        .update({ used: true, used_at: new Date().toISOString() })
        .eq('token', token)
        .eq('used', false)
        .select()

      if (updateError || !updated || updated.length === 0) {
        return res.status(200).json({
          status: 'used',
          label: data.label,
          qr_image_url: data.qr_image_url || null,
        })
      }

      return res.status(200).json({
        status: 'ok',
        target_url: data.target_url,
        label: data.label,
        qr_image_url: data.qr_image_url || null,
      })
    }

    return res.status(400).json({ error: 'Geçersiz action' })
  } catch (err) {
    console.error('USE API ERROR:', err)
    return res.status(500).json({
      error: err.message || 'Internal Server Error',
    })
  }
}