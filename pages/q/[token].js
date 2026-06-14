import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function RedirectPage() {
  const router = useRouter()
  const { token } = router.query
  const [status, setStatus] = useState('loading')
  const [targetUrl, setTargetUrl] = useState('')

  useEffect(() => {
    if (!token) return
    fetch('/api/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.status === 'ok') {
          setStatus('ok')
          setTargetUrl(data.target_url || '')
        } else {
          setStatus(data.status)
        }
      })
      .catch(() => setStatus('error'))
  }, [token])

  const activateApple = () => {
    if (!targetUrl || !targetUrl.startsWith('LPA:')) return
    const url = `https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=${encodeURIComponent(targetUrl)}`
    window.location.href = url
  }

  const activateAndroid = () => {
    if (!targetUrl || !targetUrl.startsWith('LPA:')) return
    const url = `https://esimsetup.android.com/esim_qrcode_provisioning?carddata=${encodeURIComponent(targetUrl)}`
    window.location.href = url
  }

  const screens = {
    loading: { icon: '⏳', title: 'Kontrol ediliyor...', color: '#4f98a3', bg: '#1c2a2b' },
    used: { icon: '🚫', title: 'Bu QR Kullanıldı', color: '#a12c7b', bg: '#2b1c25' },
    expired: { icon: '⏰', title: 'Süresi Doldu', color: '#da7101', bg: '#2b2010' },
    not_found: { icon: '❓', title: 'QR Bulunamadı', color: '#7a7974', bg: '#1c1b19' },
    error: { icon: '⚠️', title: 'Hata Oluştu', color: '#a13544', bg: '#2b1c1c' },
  }

  const s = screens[status] || screens.loading

  return (
    <>
      <Head><title>QR Aktivasyon</title></Head>
      <div style={{
        minHeight: '100vh', background: s.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif', padding: '24px',
        transition: 'background 0.4s ease'
      }}>
        <div style={{
          textAlign: 'center', maxWidth: '400px', width: '100%',
          background: 'rgba(255,255,255,0.04)', borderRadius: '20px',
          padding: '40px 28px', border: `1px solid ${s.color}33`
        }}>

          {status === 'loading' && (
            <>
              <div style={{ fontSize: '56px', marginBottom: '16px', lineHeight: 1 }}>⏳</div>
              <h1 style={{ color: s.color, fontSize: '20px', fontWeight: 700 }}>{s.title}</h1>
            </>
          )}

          {status === 'ok' && (
            <>
              <div style={{ fontSize: '48px', marginBottom: '12px', lineHeight: 1 }}>✅</div>
              <h1 style={{ color: '#6daa45', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
                QR Geçerli!
              </h1>
              <p style={{ color: '#9a9896', fontSize: '14px', marginBottom: '24px' }}>
                Cihazınıza göre eSIM kurulumunu seçin.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={activateApple}
                  style={{
                    width: '100%', padding: '18px 24px',
                    background: '#6daa45', color: '#fff',
                    border: 'none', borderRadius: '14px',
                    fontSize: '17px', fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(109,170,69,0.3)',
                  }}
                >
                  📱 iPhone'da eSIM'i Aktif Et
                </button>

                <button
                  onClick={activateAndroid}
                  style={{
                    width: '100%', padding: '18px 24px',
                    background: '#3ddc84', color: '#fff',
                    border: 'none', borderRadius: '14px',
                    fontSize: '17px', fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(61,220,132,0.3)',
                  }}
                >
                  🤖 Android'de eSIM'i Aktif Et
                </button>
              </div>

              <p style={{ color: '#5a5957', fontSize: '12px', marginTop: '16px' }}>
                iPhone: iOS 17.4+ | Android: Desteklenen cihazlarda
              </p>
            </>
          )}

          {['used', 'expired', 'not_found', 'error'].includes(status) && (
            <>
              <div style={{ fontSize: '56px', marginBottom: '16px', lineHeight: 1 }}>{s.icon}</div>
              <h1 style={{ color: s.color, fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>{s.title}</h1>
              <p style={{ color: '#9a9896', fontSize: '14px', lineHeight: 1.6 }}>
                {status === 'used' && 'Bu QR kodu daha önce kullanılmıştır.'}
                {status === 'expired' && 'Bu QR kodunun geçerlilik süresi dolmuştur.'}
                {status === 'not_found' && 'Bu QR kodu geçersiz veya silinmiş.'}
                {status === 'error' && 'Bir hata oluştu, lütfen tekrar deneyin.'}
              </p>
            </>
          )}
        </div>
      </div>
    </>
  )
}
