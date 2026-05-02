'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const TELEGRAM = 'https://t.me/purplebook_sat'

export default function SignUpPage() {
  const router = useRouter()
  const [step, setStep] = useState<'telegram' | 'form'>('telegram')
  const [confirmed, setConfirmed] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pwScore = (p: string) => {
    if (!p) return 0
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  }
  const score = pwScore(password)
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][score] || ''
  const strengthColor = ['', '#F87171', '#FBBF24', '#60A5FA', '#34D399'][score] || ''

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    if (password !== confirm) return setError("Passwords don't match")
    if (password.length < 8) return setError('Password must be at least 8 characters')
    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Registration failed'); setLoading(false); return }
      const result = await signIn('credentials', { email, password, redirect: false })
      router.push(result?.error ? '/auth/signin?registered=true' : '/')
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const Logo = () => (
    <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1rem', boxShadow: '0 0 32px var(--accent-glow)',
      }}>
        <span style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--accent-2)', letterSpacing: '-0.04em' }}>P</span>
      </div>
    </div>
  )

  /* ── Step 1: Telegram ─────────────────────────────────────────────── */
  if (step === 'telegram') return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem',
    }}>
      <Logo />

      <div className="glass-md fade-up" style={{ width: '100%', maxWidth: 380, padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.375rem' }}>
            Join our community
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Before registering, join the PurpleBook Telegram channel.
            Share your scores and connect with other test-takers.
          </p>
        </div>

        {/* Telegram link */}
        <a
          href={TELEGRAM} target="_blank" rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.875rem',
            padding: '1rem', borderRadius: 12, textDecoration: 'none',
            background: 'rgba(42,171,238,0.06)', border: '1px solid rgba(42,171,238,0.2)',
            marginBottom: '1.25rem', transition: 'border-color 0.2s, background 0.2s',
          }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: 'rgba(42,171,238,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="#2AABEE">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 14.617l-2.96-.924c-.64-.203-.657-.64.136-.954l11.57-4.461c.537-.194 1.006.131.828.943z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#2AABEE' }}>@purplebook_sat</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: '0.125rem' }}>Open Telegram channel</div>
          </div>
        </a>

        {/* Confirm checkbox */}
        <label style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
          cursor: 'pointer', marginBottom: '1.5rem',
        }}>
          <div
            onClick={() => setConfirmed(c => !c)}
            style={{
              width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
              border: `2px solid ${confirmed ? 'var(--accent)' : 'var(--border-hi)'}`,
              background: confirmed ? 'var(--accent)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s', cursor: 'pointer',
            }}
          >
            {confirmed && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            I've joined the channel and will share my test screenshots there.
          </span>
        </label>

        <button
          onClick={() => setStep('form')}
          disabled={!confirmed}
          className="btn btn-primary btn-lg"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Continue →
        </button>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-faint)' }}>
          Already registered?{' '}
          <Link href="/auth/signin" style={{ color: 'var(--accent-2)', textDecoration: 'none', fontWeight: 500 }}>
            Sign in
          </Link>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <Link href="/" style={{ fontSize: '0.8125rem', color: 'var(--text-faint)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to tests
        </Link>
      </div>
    </div>
  )

  /* ── Step 2: Registration form ──────────────────────────────────────── */
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem',
    }}>
      <Logo />

      <div className="glass-md fade-up" style={{ width: '100%', maxWidth: 380, padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>
            Create account
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Free access to all SAT mock tests.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
            borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem',
            fontSize: '0.875rem', color: 'var(--red)',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="label">Full name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Your name" required autoComplete="name" className="field" />
          </div>

          <div>
            <label className="label">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required autoComplete="email" className="field" />
          </div>

          <div>
            <label className="label">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters" required autoComplete="new-password" className="field" />
            {password && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '0.25rem' }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{
                      flex: 1, height: 3, borderRadius: 999,
                      background: i <= score ? strengthColor : 'var(--border-hi)',
                      transition: 'background 0.2s',
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: '0.6875rem', color: strengthColor }}>{strengthLabel}</span>
              </div>
            )}
          </div>

          <div>
            <label className="label">Confirm password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat your password" required autoComplete="new-password"
              className="field"
              style={{
                borderColor: confirm && confirm !== password ? 'rgba(248,113,113,0.5)'
                           : confirm && confirm === password ? 'rgba(52,211,153,0.5)'
                           : undefined,
              }}
            />
            {confirm && confirm !== password && (
              <p style={{ fontSize: '0.6875rem', color: 'var(--red)', marginTop: '0.25rem' }}>
                Passwords don't match
              </p>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-lg"
            style={{ marginTop: '0.25rem', justifyContent: 'center' }}>
            {loading
              ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Creating account…
                </span>
              : 'Create account'}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-faint)' }}>
          Already have an account?{' '}
          <Link href="/auth/signin" style={{ color: 'var(--accent-2)', textDecoration: 'none', fontWeight: 500 }}>
            Sign in
          </Link>
        </div>
      </div>

      <button
        onClick={() => setStep('telegram')}
        style={{ marginTop: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: '0.375rem', fontFamily: 'inherit' }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </button>
    </div>
  )
}
