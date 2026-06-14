import { useEffect, useState } from 'react'

export default function RedirectPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('Kontrol ediliyor...')
  const [targetUrl, setTargetUrl] = useState('')
  const [label, setLabel] = useState('')
  const [qrImageUrl, setQrImageUrl] = useState('')
  const [token, setToken] = useState('')

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search)
      const tokenParam = params.get('token')

      if (!tokenParam) {
        setStatus('error')
        setMessage('Token bulunamadı')
        setLoading(false)
        return
      }

      setToken(tokenParam)

      try {
        const res = await fetch('/api/use', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: tokenParam, action: 'preview' }),
        })

        const data = await res.json()

        if ((data.status === 'ready' || data.status === 'ok') && data.target_url) {
          setStatus('ready')
          setMessage('Kurulum hazır')
          setTargetUrl(data.target_url)
          setLabel(data.label || '')
          setQrImageUrl(data.qr_image_url || '')
          setLoading(false)
          return
        }

        if (data.status === 'used') {
          setStatus('used')
          setMessage('Bu kod zaten kullanılmış')
          setLabel(data.label || '')
          setQrImageUrl(data.qr_image_url || '')
          setLoading(false)
          return
        }

        if (data.status === 'expired') {
          setStatus('expired')
          setMessage('Bu kodun süresi dolmuş')
          setLabel(data.label || '')
          setQrImageUrl(data.qr_image_url || '')
          setLoading(false)
          return
        }

        if (data.status === 'not_found') {
          setStatus('not_found')
          setMessage('Kod bulunamadı')
          setLoading(false)
          return
        }

        setStatus('error')
        setMessage('Geçersiz işlem')
        setLoading(false)
      } catch (err) {
        setStatus('error')
        setMessage('Bir hata oluştu')
        setLoading(false)
      }
    }

    run()
  }, [])

  const getFinalUrl = (rawUrl) => {
    let finalUrl = rawUrl
    const ua = navigator.userAgent || ''
    const isAndroid = /Android/i.test(ua)
    const isIOS = /iPhone|iPad|iPod/i.test(ua)
    const isLpa = typeof finalUrl === 'string' && finalUrl.toUpperCase().startsWith('LPA:')

    if (isLpa) {
      const encoded = encodeURIComponent(finalUrl)

      if (isIOS) {
        finalUrl = `https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=${encoded}`
      } else if (isAndroid) {
        finalUrl = `https://esimsetup.android.com/esim_qrcode_provisioning?carddata=${encoded}`
      }
    }

    return finalUrl
  }

  const handleStart = async () => {
    if (!token || !targetUrl) return

    setSubmitting(true)

    try {
      const res = await fetch('/api/use', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, action: 'consume' }),
      })

      const data = await res.json()

      if (data.status === 'ok' && data.target_url) {
        window.location.href = getFinalUrl(data.target_url)
        return
      }

      if (data.status === 'used') {
        setStatus('used')
        setMessage('Bu kod zaten kullanılmış')
        setSubmitting(false)
        return
      }

      if (data.status === 'expired') {
        setStatus('expired')
        setMessage('Bu kodun süresi dolmuş')
        setSubmitting(false)
        return
      }

      setStatus('error')
      setMessage('İşlem tamamlanamadı')
      setSubmitting(false)
    } catch (err) {
      setStatus('error')
      setMessage('Bir hata oluştu')
      setSubmitting(false)
    }
  }

  const cardStyle = {
    maxWidth: '460px',
    width: '100%',
    background: '#1c1b19',
    border: '1px solid #262523',
    borderRadius: '18px',
    padding: '24px',
    boxSizing: 'border-box',
    boxShadow: '0 12px 32px rgba(0,0,0,0.28)',
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div style={cardStyle}>
          <div style={{ fontSize: '15px', color: '#7a7974', marginBottom: '8px' }}>Yükleniyor</div>
          <h1 style={{ fontSize: '28px', color: '#fff', margin: 0 }}>{message}</h1>
        </div>
      )
    }

    if (status === 'ready') {
      return (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: '#1a2e30',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4f98a3',
                fontSize: '18px',
                fontWeight: 700,
              }}
            >
              e
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#7a7974' }}>eSIM Kurulumu</div>
              <div style={{ fontSize: '15px', color: '#fff', fontWeight: 700 }}>
                {label || 'Hazır'}
              </div>
            </div>
          </div>

          {qrImageUrl && (
            <div
              style={{
                marginBottom: '18px',
                background: '#22211f',
                border: '1px solid #393836',
                borderRadius: '14px',
                padding: '12px',
                textAlign: 'center',
              }}
            >
              <img
                src={qrImageUrl}
                alt="QR görseli"
                style={{
                  width: '100%',
                  maxWidth: '280px',
                  borderRadius: '12px',
                  margin: '0 auto',
                  display: 'block',
                }}
              />
            </div>
          )}

          <h1 style={{ fontSize: '26px', lineHeight: 1.2, color: '#fff', margin: '0 0 10px 0' }}>
            Kurulum hazır
          </h1>

          <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#9a9896', margin: '0 0 18px 0' }}>
            Devam etmek için aşağıdaki butona dokun. Butona bastığında bu kod tek kullanımlık olarak işaretlenir.
          </p>

          <button
            onClick={handleStart}
            disabled={submitting}
            style={{
              width: '100%',
              padding: '14px 16px',
              background: submitting ? '#2d4a4e' : '#4f98a3',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Yönlendiriliyor...' : 'Kurulumu Başlat'}
          </button>
        </div>
      )
    }

    return (
      <div style={cardStyle}>
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background:
              status === 'used'
                ? '#3d1f35'
                : status === 'expired'
                ? '#3d2810'
                : '#2a1f1f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            fontSize: '22px',
          }}
        >
          {status === 'used' ? '✓' : status === 'expired' ? '!' : '×'}
        </div>

        <h1 style={{ fontSize: '26px', lineHeight: 1.2, color: '#fff', margin: '0 0 10px 0' }}>
          {message}
        </h1>

        {label && (
          <p style={{ fontSize: '14px', color: '#4f98a3', margin: '0 0 8px 0' }}>
            {label}
          </p>
        )}

        <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#9a9896', margin: 0 }}>
          Lütfen yeni bir QR kod deneyin veya size verilen bağlantıyı yeniden kontrol edin.
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #171614 0%, #11100f 100%)',
        color: '#cdccca',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      {renderContent()}
    </div>
  )
}