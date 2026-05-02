'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

const YEARS = [2025, 2024, 2023]

export default function HomePage() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <span className="logo">Purple<span>Book</span></span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {session ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: '999px', padding: '0.3rem 0.75rem 0.3rem 0.35rem',
                    cursor: 'pointer', transition: 'border-color 0.2s',
                    color: 'var(--text-muted)', fontSize: '0.8125rem',
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--accent-2)', fontWeight: 700, fontSize: '0.75rem',
                  }}>
                    {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {session.user?.name || session.user?.email}
                  </span>
                </button>

                {menuOpen && (
                  <>
                    <div style={{ position: 'fixed', inset: 0 }} onClick={() => setMenuOpen(false)} />
                    <div className="glass" style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                      width: 180, padding: '0.375rem', zIndex: 200,
                    }}>
                      <Link
                        href="/certificates"
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: 'block', padding: '0.55rem 0.875rem',
                          borderRadius: '8px', fontSize: '0.8125rem',
                          color: 'var(--text-muted)', textDecoration: 'none',
                          transition: 'background 0.15s, color 0.15s',
                        }}
                        className="menu-link"
                      >
                        My Certificates
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left',
                          padding: '0.55rem 0.875rem', borderRadius: '8px',
                          fontSize: '0.8125rem', color: 'var(--red)',
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontFamily: 'inherit', transition: 'background 0.15s',
                        }}
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/signin" className="btn btn-outline btn-sm">Sign in</Link>
                <Link href="/auth/signup" className="btn btn-primary btn-sm">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main style={{ flex: 1, maxWidth: 960, margin: '0 auto', padding: '5rem 1.5rem 4rem', width: '100%' }}>
        <div className="fade-up" style={{ marginBottom: '3.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'var(--accent-dim)', border: '1px solid rgba(167,139,250,0.2)',
            borderRadius: 999, padding: '0.3rem 0.875rem',
            fontSize: '0.75rem', fontWeight: 500, color: 'var(--accent-2)',
            marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-2)', display: 'inline-block' }} />
            Digital SAT Practice
          </div>

          <h1 style={{
            fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', fontWeight: 700,
            lineHeight: 1.12, letterSpacing: '-0.03em',
            color: 'var(--text)', marginBottom: '1rem',
          }}>
            Ace the SAT with<br />
            <span style={{
              background: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              full mock tests
            </span>
          </h1>

          <p style={{ fontSize: '1.0625rem', color: 'var(--text-muted)', maxWidth: 480, lineHeight: 1.7 }}>
            Practice with real exam questions from 2023, 2024, and 2025.
            Module 1 → Module 2. Math & Reading/Writing.
          </p>
        </div>

        {/* Year cards */}
        <div className="fade-up-d1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '4rem' }}>
          {YEARS.map((year, i) => (
            <Link key={year} href={`/mock-tests/${year}`} className="year-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '0.1em', color: 'var(--text-faint)', marginBottom: '0.75rem',
                }}>
                  SAT
                </div>
                <div style={{
                  fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.04em',
                  color: 'var(--text)', marginBottom: '0.75rem', lineHeight: 1,
                }}>
                  {year}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  4 modules · Reading/Writing + Math<br />Module 1 &amp; 2 per section
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                  fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-2)',
                }}>
                  Start practice
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* How it works */}
        <div className="fade-up-d2">
          <div style={{
            fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: 'var(--text-faint)', marginBottom: '1.5rem',
          }}>
            How it works
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { n: '01', title: 'Pick a year', desc: 'Choose 2023, 2024, or 2025 to access that year\'s full practice test.' },
              { n: '02', title: 'Take the modules', desc: 'Complete Module 1 first. Review or go straight to Module 2.' },
              { n: '03', title: 'Share your score', desc: 'Screenshot your results and send to our Telegram channel.' },
            ].map(s => (
              <div key={s.n} className="glass" style={{ padding: '1.25rem' }}>
                <div style={{
                  fontSize: '0.6875rem', fontWeight: 700, color: 'var(--accent-2)',
                  letterSpacing: '0.06em', marginBottom: '0.625rem',
                }}>
                  {s.n}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text)', marginBottom: '0.375rem' }}>
                  {s.title}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {s.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer style={{
        borderTop: '1px solid var(--border)', padding: '1.25rem 1.5rem',
        textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-faint)',
        position: 'relative', zIndex: 1,
      }}>
        © 2025 PurpleBook
      </footer>

      <style>{`
        .menu-link:hover { background: var(--surface-hi); color: var(--text) !important; }
      `}</style>
    </div>
  )
}
