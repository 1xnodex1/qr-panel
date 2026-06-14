import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function Panel() {
  const [password, setPassword] = useState('')
  const [label, setLabel] = useState('')
  const [count, setCount] = useState(1)
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState([])
  const [tokens, setTokens] = useState([])
  const [tab, setTab] = useState('create')
  const [listLoading, setListLoading] = useState(false)
  const [copied, setCopied] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadTokens = async () => {
    setListLoading(true)
    const r = await fetch('/api/list')
    const d = await r.json()
    setTokens(d.tokens || [])
    setListLoading(false)
  }

  useEffect(() => {
    if (tab === 'list') loadTokens()
  }, [tab])

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setGenerated([])

    try {
      const r = await fetch('/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: label || undefined,
          count: parseInt(count),
          password,
        }),
      })

      const d = await r.json()

      if (!r.ok) {
        alert(d.error || 'QR oluşturulamadı')
      } else if (d.tokens) {
        setGenerated(d.tokens)
      }
    } catch {
      alert('Bir hata oluştu')
    }

    setLoading(false)
  }

  const handleDeleteAll = async () => {
    const enteredPassword = window.prompt('Tüm QR kodlarını silmek için şifreyi gir')
    if (!enteredPassword) return

    const confirmed = window.confirm('Tüm QR kodları silinsin mi? Bu işlem geri alınamaz.')
    if (!confirmed) return

    setDeleteLoading(true)

    try {
      const r = await fetch('/api/delete-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: enteredPassword }),
      })

      const d = await r.json()

      if (!r.ok) {
        alert(d.error || 'Silme başarısız')
      } else {
        alert('Tüm QR kodları silindi')
        setTokens([])
        setGenerated([])
        loadTokens()
      }
    } catch {
      alert('Bir hata oluştu')
    }

    setDeleteLoading(false)
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const statusBadge = (t) => {
    if (t.used) return { label: 'Kullanıldı', color: '#a12c7b', bg: '#3d1f35' }
    if (t.expires_at && new Date(t.expires_at) < new Date()) return { label: 'Süresi Doldu', color: '#da7101', bg: '#3d2810' }
    return { label: 'Aktif', color: '#6daa45', bg: '#1e3510' }
  }

  return (
    <>
      <Head>
        <title>QR Panel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ minHeight: '100vh', background: '#171614', color: '#cdccca', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <header style={{ background: '#1c1b19', borderBottom: '1px solid #262523', padding: '0 16px', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="2" y="2" width="11" height="11" rx="2" fill="#4f98a3" />
                <rect x="15" y="2" width="11" height="11" rx="2" fill="#4f98a3" opacity="0.6" />
                <rect x="2" y="15" width="11" height="11" rx="2" fill="#4f98a3" opacity="0.6" />
                <rect x="17" y="17" width="3" height="3" fill="#4f98a3" />
                <rect x="22" y="17" width="4" height="3" fill="#4f98a3" opacity="0.8" />
                <rect x="17" y="22" width="4" height="3" fill="#4f98a3" opacity="0.8" />
                <rect x="23" y="22" width="3" height="3" fill="#4f98a3" />
              </svg>
              <span style={{ fontWeight: 700, fontSize: '17px', color: '#fff' }}>QR Panel</span>
            </div>
            <span style={{ fontSize: '12px', color: '#5a5957', background: '#22211f', padding: '4px 10px', borderRadius: '20px' }}>Tek Kullanımlık</span>
          </div>
        </header>

        <div style={{ background: '#1c1b19', borderBottom: '1px solid #262523' }}>
          <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', padding: '0 16px' }}>
            {['create', 'list'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '14px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: tab === t ? '#4f98a3' : '#7a7974',
                  borderBottom: tab === t ? '2px solid #4f98a3' : '2px solid transparent',
                  background: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderTop: 'none',
                  borderRadius: 0,
                  cursor: 'pointer',
                }}
              >
                {t === 'create' ? '＋ QR Oluştur' : "📋 Tüm QR'lar"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '20px 16px' }}>
          {tab === 'create' && (
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#7a7974', marginBottom: '6px', fontWeight: 600 }}>
                  Oluşturma Şifresi *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Şifre gir"
                  style={{ width: '100%', padding: '12px 14px', background: '#22211f', border: '1px solid #393836', borderRadius: '10px', color: '#cdccca', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#7a7974', marginBottom: '6px', fontWeight: 600 }}>Etiket (opsiyonel)</label>
                <input
                  type="text"
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  placeholder="Etiket"
                  style={{ width: '100%', padding: '12px 14px', background: '#22211f', border: '1px solid #393836', borderRadius: '10px', color: '#cdccca', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#7a7974', marginBottom: '6px', fontWeight: 600 }}>Adet</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={count}
                  onChange={e => setCount(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', background: '#22211f', border: '1px solid #393836', borderRadius: '10px', color: '#cdccca', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '14px',
                  background: loading ? '#2d4a4e' : '#4f98a3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '4px',
                }}
              >
                {loading ? 'Oluşturuluyor...' : `${count} Adet QR Oluştur`}
              </button>
            </form>
          )}

          {tab === 'create' && generated.length > 0 && (
            <div style={{ marginTop: '28px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#6daa45', marginBottom: '16px' }}>
                ✅ {generated.length} QR oluşturuldu!
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {generated.map((t, i) => (
                  <div key={t.id} style={{ background: '#1c1b19', border: '1px solid #393836', borderRadius: '14px', padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <img src={t.qrImage} alt="QR" width={100} height={100} style={{ borderRadius: '8px', flexShrink: 0, background: '#fff', padding: '4px' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', color: '#5a5957', marginBottom: '4px' }}>
                          QR #{i + 1} {t.label && `· ${t.label}`}
                        </div>
                        <div style={{ fontSize: '12px', color: '#4f98a3', wordBreak: 'break-all', marginBottom: '10px', background: '#1a2e30', padding: '8px', borderRadius: '6px' }}>
                          {t.qrUrl}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => copyToClipboard(t.qrUrl, t.id)}
                            style={{
                              padding: '8px 12px',
                              background: copied === t.id ? '#1e3510' : '#22211f',
                              color: copied === t.id ? '#6daa45' : '#9a9896',
                              border: '1px solid #393836',
                              borderRadius: '8px',
                              fontSize: '13px',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                          >
                            {copied === t.id ? '✓ Kopyalandı' : '📋 Linki Kopyala'}
                          </button>
                          <a
                            href={t.qrImage}
                            download={`qr-${t.token}.png`}
                            style={{
                              padding: '8px 12px',
                              background: '#22211f',
                              color: '#9a9896',
                              border: '1px solid #393836',
                              borderRadius: '8px',
                              fontSize: '13px',
                              textDecoration: 'none',
                              fontWeight: 600,
                            }}
                          >
                            ⬇️ İndir
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'list' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 700 }}>Tüm QR Kodları</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={loadTokens}
                    style={{ padding: '8px 14px', background: '#22211f', color: '#7a7974', border: '1px solid #393836', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
                  >
                    {listLoading ? '...' : '↻ Yenile'}
                  </button>
                  <button
                    onClick={handleDeleteAll}
                    disabled={deleteLoading}
                    style={{ padding: '8px 14px', background: deleteLoading ? '#4a2424' : '#a13544', color: '#fff', border: '1px solid #a13544', borderRadius: '8px', fontSize: '13px', cursor: deleteLoading ? 'not-allowed' : 'pointer', fontWeight: 700 }}
                  >
                    {deleteLoading ? 'Siliniyor...' : '🗑 Tümünü Temizle'}
                  </button>
                </div>
              </div>

              {listLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#5a5957' }}>Yükleniyor...</div>
              ) : tokens.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#5a5957' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                  <div>Henüz QR kodu oluşturulmadı</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {tokens.map(t => {
                    const badge = statusBadge(t)
                    const qrUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/r?token=${t.token}`
                    const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}`
                    return (
                      <div key={t.id} style={{ background: '#1c1b19', border: '1px solid #262523', borderRadius: '12px', padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                          <img
                            src={qrImage}
                            alt="QR"
                            width={84}
                            height={84}
                            style={{ borderRadius: '8px', flexShrink: 0, background: '#fff', padding: '4px' }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#cdccca' }}>{t.label || t.token}</span>
                                  <span style={{ fontSize: '11px', fontWeight: 700, color: badge.color, background: badge.bg, padding: '2px 8px', borderRadius: '20px' }}>
                                    {badge.label}
                                  </span>
                                </div>

                                <div
                                  style={{
                                    fontSize: '12px',
                                    color: '#4f98a3',
                                    wordBreak: 'break-all',
                                    marginBottom: '8px',
                                    background: '#1a2e30',
                                    padding: '8px',
                                    borderRadius: '6px',
                                  }}
                                >
                                  {qrUrl}
                                </div>

                                <div style={{ fontSize: '11px', color: '#393836' }}>
                                  {new Date(t.created_at).toLocaleString('tr-TR')}
                                  {t.used_at && ` · Kullanıldı: ${new Date(t.used_at).toLocaleString('tr-TR')}`}
                                </div>
                              </div>

                              <button
                                onClick={() => copyToClipboard(qrUrl, t.id)}
                                style={{
                                  padding: '8px',
                                  background: copied === t.id ? '#1e3510' : 'transparent',
                                  color: copied === t.id ? '#6daa45' : '#5a5957',
                                  border: '1px solid #393836',
                                  borderRadius: '8px',
                                  fontSize: '13px',
                                  cursor: 'pointer',
                                  flexShrink: 0,
                                }}
                              >
                                {copied === t.id ? '✓' : '📋'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}