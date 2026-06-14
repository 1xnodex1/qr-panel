# 📱 Tek Kullanımlık QR — Mobil Kurulum Rehberi

## Adım 1: Supabase — Veritabanı Kur (5 dakika)

1. **Tarayıcıda** → https://supabase.com → "Start your project" → GitHub ile giriş yap
2. "New Project" → Proje adı: `qr-panel` → Şifre belirle → Region: **Europe (Frankfurt)** → "Create new project"
3. Sol menüde **SQL Editor** → "New query" → `supabase.sql` dosyasındaki kodu yapıştır → **Run**
4. Sol menüde **Settings → API** → şunları kopyala ve not al:
   - **Project URL** → `https://XXXX.supabase.co`
   - **anon public** key → uzun bir JWT token

---

## Adım 2: GitHub — Kodu Yükle (5 dakika)

1. https://github.com → "New repository" → Ad: `qr-panel` → Public → "Create repository"
2. "uploading an existing file" linkine tıkla
3. Şu dosyaları yükle (klasör yapısına dikkat et):
   ```
   package.json
   next.config.js
   supabase.sql          ← sadece referans, yükleme zorunlu değil
   lib/supabaseClient.js
   pages/index.js
   pages/api/create.js
   pages/api/use.js
   pages/api/list.js
   pages/q/[token].js    ← dosya adı tam böyle olmalı: [token].js
   ```
4. "Commit changes" → "Commit directly to the main branch"

> **Not:** `pages/q/` klasörünü oluştururken GitHub'da "pages/q/[token].js" şeklinde yaz, otomatik klasör oluşturur.

---

## Adım 3: Vercel — Deploy Et (3 dakika)

1. https://vercel.com → "Continue with GitHub" ile giriş yap
2. "Add New Project" → `qr-panel` reposunu seç → "Import"
3. **Environment Variables** bölümüne şunları ekle:

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase'den kopyaladığın URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase'den kopyaladığın anon key |
   | `NEXT_PUBLIC_APP_URL` | Vercel'in sana vereceği URL (deploy sonrası güncelle) |

4. "Deploy" → 2-3 dakika bekle

5. Deploy tamamlanınca Vercel sana bir URL verir: `https://qr-panel-xxx.vercel.app`
6. Bu URL'yi kopyala → Vercel'de **Settings → Environment Variables** → `NEXT_PUBLIC_APP_URL` değerini bu URL ile güncelle → **Redeploy**

---

## Kullanım

- **Panel:** `https://qr-panel-xxx.vercel.app` → QR oluştur, listele
- **Tarama:** Oluşturulan QR'lar otomatik `/q/TOKEN` adresine yönlendirir
  - İlk tarama → hedef URL'ye yönlendirir ✅
  - İkinci tarama → "Bu QR Kullanıldı" ekranı 🚫

---

## Sorun Giderme

- **"supabaseUrl is required" hatası** → Environment Variables eksik, kontrol et
- **QR çalışmıyor** → `NEXT_PUBLIC_APP_URL` yanlış, Vercel URL'siyle güncelle
- **Token tablosu yok** → Supabase SQL Editor'da `supabase.sql` kodunu tekrar çalıştır
