import crypto from 'crypto'
import { supabase } from '../../lib/supabaseClient'

const FIXED_TARGET_URL = 'LPA:1$rsp.truphone.com$QRF-CLUJAIRPORT-PMRDGIR2EARDIIT5'
const CREATE_PASSWORD = 'Bingöl12x.'

function generateToken(length = 24) {
  return crypto.randomBytes(length).toString('hex').slice(0, length)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      label,
      count = 1,
      expiresInHours,
      qrImageUrl = null,
      password,
    } = req.body

    if (!password) {
      return res.status(400).json({ error: 'Şifre gerekli' })
    }

    if (password !== CREATE_PASSWORD) {
      return res.status(403).json({ error: 'Şifre yanlış' })
    }

    const safeCount = Math.min(Math.max(parseInt(count) || 1, 1), 50)
    const origin =
      req.headers['x-forwarded-proto'] && req.headers['x-forwarded-host']
        ? `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}`
        : `http://${req.headers.host}`

    const rows = []

    for (let i = 0; i < safeCount; i++) {
      const token = generateToken(24)

      let expires_at = null
      if (expiresInHours) {
        const d = new Date()
        d.setHours(d.getHours() + parseInt(expiresInHours))
        expires_at = d.toISOString()
      }

      rows.push({
        token,
        target_url: FIXED_TARGET_URL,
        label: label || null,
        qr_image_url: qrImageUrl,
        used: false,
        used_at: null,
        expires_at,
        password_token: password,
      })
    }

    const { data, error } = await supabase
      .from('tokens')
      .insert(rows)
      .select()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    const tokens = (data || []).map((item) => {
      const qrUrl = `${origin}/r?token=${item.token}`
      const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}`
      return {
        id: item.id,
        token: item.token,
        label: item.label,
        qrUrl,
        qrImage,
      }
    })

    return res.status(200).json({ tokens })
  } catch (err) {
    console.error('CREATE API ERROR:', err)
    return res.status(500).json({ error: err.message || 'Internal Server Error' })
  }
}