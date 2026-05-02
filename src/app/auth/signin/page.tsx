'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const registered = searchParams.get('registered')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) {
      setError('Incorrect email or password.')
      setLoading(false)
    } else {
      router.push(callbackUrl)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem',
    }}>
      {/* Logo mark */}
      <div className="fade-up" style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem',
          boxShadow: '0 0 32px var(--accent-glow)',
        }}>
          <span style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--accent-2)', letterSpacing: '-0.04em' }}>P</span>
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
          Welcome back
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Sign in to PurpleBook
        </div>
      </div>

      <div className="glass-md fade-up-d1" style={{ width: '100%', maxWidth: 380, padding: '2rem' }}>
        {registered && (
          <div style={{
            background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)',
            borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem',
            fontSize: '0.875rem', color: '#34D399',
          }}>
            Account created — sign in to continue.
          </div>
        )}

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
            <label className="label">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required autoComplete="email"
              className="field"
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Your password" required autoComplete="current-password"
              className="field"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ marginTop: '0.25rem', justifyContent: 'center' }}>
            {loading
              ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Signing in…
                </span>
              : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-faint)' }}>
          No account?{' '}
          <Link href="/auth/signup" style={{ color: 'var(--accent-2)', textDecoration: 'none', fontWeight: 500 }}>
            Register free
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
}

export default function SignInPage() {
  return <Suspense><SignInForm /></Suspense>
}
