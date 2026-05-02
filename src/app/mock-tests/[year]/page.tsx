'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface TestModule {
  id: string
  title: string
  moduleNumber: number
  section: string
  timeLimit: number
  _count: { questions: number }
}

interface SectionGroup {
  module1: TestModule | null
  module2: TestModule | null
}

export default function YearPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const year = Number(params.year)

  const [math, setMath] = useState<SectionGroup>({ module1: null, module2: null })
  const [english, setEnglish] = useState<SectionGroup>({ module1: null, module2: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!year || isNaN(year)) return
    fetch(`/api/practice-tests?year=${year}`)
      .then(r => r.json())
      .then((tests: TestModule[]) => {
        const m: SectionGroup = { module1: null, module2: null }
        const e: SectionGroup = { module1: null, module2: null }
        for (const t of tests) {
          if (t.section === 'math') {
            if (t.moduleNumber === 1) m.module1 = t
            else m.module2 = t
          } else {
            if (t.moduleNumber === 1) e.module1 = t
            else e.module2 = t
          }
        }
        setMath(m)
        setEnglish(e)
        setLoading(false)
      })
  }, [year])

  const handleStart = (testId: string) => {
    if (!session) router.push(`/auth/signin?callbackUrl=/practice-tests/${testId}`)
    else router.push(`/practice-tests/${testId}`)
  }

  if (loading) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh' }}>
      <nav className="navbar">
        <div className="navbar-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link href="/" style={{
              color: 'var(--text-muted)', fontSize: '0.8125rem', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '0.375rem', transition: 'color 0.2s',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
            <span className="logo">Purple<span>Book</span></span>
          </div>

          {!session && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link href="/auth/signin" className="btn btn-outline btn-sm">Sign in</Link>
              <Link href="/auth/signup" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
        </div>
      </nav>

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '3.5rem 1.5rem 4rem', width: '100%' }}>
        {/* Header */}
        <div className="fade-up" style={{ marginBottom: '2.5rem' }}>
          <div style={{
            fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: 'var(--text-faint)', marginBottom: '0.5rem',
          }}>
            SAT Full Practice Test
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--text)', lineHeight: 1 }}>
            {year}
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.625rem' }}>
            Complete all four modules in order for a realistic full-test experience.
          </p>
        </div>

        {/* Guest banner */}
        {!session && (
          <div className="alert alert-warn fade-up-d1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.875rem' }}>
              <strong style={{ color: '#FCD34D' }}>Sign in</strong> to save your results and earn certificates.
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link href="/auth/signin" className="btn btn-outline btn-sm">Sign in</Link>
              <Link href="/auth/signup" className="btn btn-primary btn-sm">Register free</Link>
            </div>
          </div>
        )}

        {/* Section cards */}
        <div className="fade-up-d1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <SectionCard
            icon="✦"
            title="Reading & Writing"
            subtitle="Craft & Structure · Information & Ideas · Standard English"
            group={english}
            onStart={handleStart}
          />
          <SectionCard
            icon="∑"
            title="Math"
            subtitle="Algebra · Advanced Math · Problem Solving · Geometry"
            group={math}
            onStart={handleStart}
          />
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-faint)' }}>
          After Module 1 you'll get a choice to review your answers or proceed directly to Module 2.
        </p>
      </main>
    </div>
  )
}

function SectionCard({
  icon, title, subtitle, group, onStart,
}: {
  icon: string
  title: string
  subtitle: string
  group: SectionGroup
  onStart: (id: string) => void
}) {
  return (
    <div className="glass" style={{ overflow: 'hidden' }}>
      {/* Card header */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface-md)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
          <span style={{ color: 'var(--accent-2)', fontSize: '1rem', fontWeight: 700 }}>{icon}</span>
          <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text)' }}>{title}</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', lineHeight: 1.5 }}>{subtitle}</p>
      </div>

      {/* Modules */}
      {[group.module1, group.module2].map((mod, idx) => {
        if (!mod) return null
        return (
          <div key={mod.id} style={{
            padding: '1rem 1.5rem',
            borderBottom: idx === 0 ? '1px solid var(--border)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '0.2rem' }}>
                Module {idx + 1}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
                {mod._count.questions} questions · {mod.timeLimit} min
              </div>
            </div>
            <button
              onClick={() => onStart(mod.id)}
              className="btn btn-primary btn-sm"
            >
              Start →
            </button>
          </div>
        )
      })}
    </div>
  )
}
