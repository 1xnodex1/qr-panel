-- Tokens tablosunu oluştur (daha önce oluşturduysan bu kısmı atla)
CREATE TABLE IF NOT EXISTS tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  target_url TEXT NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  label TEXT,
  qr_image_url TEXT  -- orijinal QR görselinin URL'si
);

ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkese okuma" ON tokens FOR SELECT USING (true);
CREATE POLICY "Herkese ekleme" ON tokens FOR INSERT WITH CHECK (true);
CREATE POLICY "Herkese guncelleme" ON tokens FOR UPDATE USING (true);

-- Storage bucket oluştur (SQL Editor'da çalıştır)
INSERT INTO storage.buckets (id, name, public) VALUES ('qr-images', 'qr-images', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Herkese okuma storage" ON storage.objects FOR SELECT USING (bucket_id = 'qr-images');
CREATE POLICY "Herkese yukleme storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'qr-images');
