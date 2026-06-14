import { supabase } from '../../lib/supabaseClient'

export const config = { api: { bodyParser: { sizeLimit: '5mb' } } }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { base64, filename } = req.body
  if (!base64 || !filename) return res.status(400).json({ error: 'base64 ve filename gerekli' })

  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64Data, 'base64')
  const ext = filename.split('.').pop() || 'png'
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { data, error } = await supabase.storage
    .from('qr-images')
    .upload(uniqueName, buffer, { contentType: `image/${ext}`, upsert: false })

  if (error) return res.status(500).json({ error: error.message })

  const { data: urlData } = supabase.storage.from('qr-images').getPublicUrl(uniqueName)

  return res.status(200).json({ url: urlData.publicUrl })
}
