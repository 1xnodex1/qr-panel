import { supabase } from '../../lib/supabaseClient'

const CREATE_PASSWORD = 'Bingöl12x.'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { password } = req.body

    if (!password) {
      return res.status(400).json({ error: 'Şifre gerekli' })
    }

    if (password !== CREATE_PASSWORD) {
      return res.status(403).json({ error: 'Şifre yanlış' })
    }

    const { error } = await supabase
      .from('tokens')
      .delete()
      .not('id', 'is', null)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal Server Error' })
  }
}