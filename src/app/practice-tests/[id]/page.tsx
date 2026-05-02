'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

interface Question {
  id: string
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  explanation: string | null
  order: number
}

interface Test {
  id: string
  title: string
  year: number
  moduleNumber: number
  section: string
  timeLimit: number
  questions: Question[]
  companionModuleId: string | null
}

interface Result {
  score: number
  totalQuestions: number
  percentage: number
  detailedAnswers: Array<{
    questionId: string
    userAnswer: string
    correctAnswer: string
    isCorrect: boolean
  }>
  certificateDbId: string | null
  testsCompleted: number
}

type Phase = 'intro' | 'quiz' | 'module1Done' | 'review' | 'results'

const OPTS = ['A', 'B', 'C', 'D'] as const
const TELEGRAM = 'https://t.me/purplebook_sat'

const optText = (q: Question, k: string) => q[`option${k}` as keyof Question] as string

export default function TestPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const testId = params.id as string

  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState<Phase>('intro')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    fetch(`/api/practice-tests/${testId}`)
      .then(r => r.json())
      .then(d => { setTest(d); setLoading(false) })
  }, [testId])

  useEffect(() => {
    if (phase !== 'quiz' || timeLeft <= 0) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); submitAnswers(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase])

  const startQuiz = () => {
    setPhase('quiz')
    setTimeLeft((test?.timeLimit || 32) * 60)
    setStartTime(Date.now())
  }

  const handleAnswer = (qId: string, opt: string) => setAnswers(p => ({ ...p, [qId]: opt }))

  const submitAnswers = async () => {
    if (submitting || !test) return
    setSubmitting(true)
    clearInterval(timerRef.current)

    if (!session) {
      let score = 0
      const detailedAnswers = test.questions.map(q => {
        const ua = answers[q.id]
        const ok = ua === q.correctAnswer
        if (ok) score++
        return { questionId: q.id, userAnswer: ua, correctAnswer: q.correctAnswer, isCorrect: ok }
      })
      setResult({ score, totalQuestions: test.questions.length, percentage: Math.round(score / test.questions.length * 100), detailedAnswers, certificateDbId: null, testsCompleted: 0 })
      setPhase(test.moduleNumber === 1 && test.companionModuleId ? 'module1Done' : 'results')
      setSubmitting(false)
      return
    }

    const timeTaken = Math.round((Date.now() - startTime) / 1000)
    const res = await fetch(`/api/practice-tests/${testId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, timeTaken }),
    })
    if (res.ok) {
      const data = await res.json()
      setResult(data)
      setPhase(test.moduleNumber === 1 && test.companionModuleId ? 'module1Done' : 'results')
    }
    setSubmitting(false)
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const sectionLabel = (s: string) => s === 'math' ? 'Math' : 'Reading & Writing'

  if (loading) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  )

  if (!test) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Test not found.</p>
        <Link href="/" className="btn btn-primary btn-sm">Go home</Link>
      </div>
    </div>
  )

  /* ── INTRO ──────────────────────────────────────────────────────────── */
  if (phase === 'intro') return (
    <div style={{ minHeight: '100dvh' }}>
      <nav className="navbar">
        <div className="navbar-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => router.back()} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
            <span className="logo">Purple<span>Book</span></span>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '4rem 1.5rem' }} className="fade-up">
        <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', marginBottom: '0.5rem' }}>
          SAT {test.year} · {sectionLabel(test.section)}
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: '0.5rem' }}>
          Module {test.moduleNumber}
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', margin: '2rem 0' }}>
          {[
            { v: test.questions.length, l: 'Questions' },
            { v: test.timeLimit, l: 'Minutes' },
            { v: test.moduleNumber, l: 'Module' },
          ].map(item => (
            <div key={item.l} className="glass" style={{ padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em' }}>{item.v}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-faint)', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.l}</div>
            </div>
          ))}
        </div>

        {!session && (
          <div className="alert alert-warn" style={{ marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            Not signed in — results won't be saved.{' '}
            <Link href={`/auth/signin?callbackUrl=/practice-tests/${testId}`} style={{ color: '#FCD34D', fontWeight: 600 }}>
              Sign in
            </Link>
          </div>
        )}

        <button onClick={startQuiz} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
          Begin Module {test.moduleNumber}
        </button>
      </div>
    </div>
  )

  /* ── QUIZ ───────────────────────────────────────────────────────────── */
  if (phase === 'quiz') {
    const q = test.questions[currentQ]
    const isLast = currentQ === test.questions.length - 1
    const isLow = timeLeft < 60
    const prog = (currentQ / test.questions.length) * 100
    const answered = Object.keys(answers).length

    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        {/* Fixed top bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(7,7,17,0.85)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '0.625rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
              {currentQ + 1} / {test.questions.length}
            </span>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${prog}%` }} />
            </div>
            <div className={`timer${isLow ? ' low' : ''}`}>{fmt(timeLeft)}</div>
          </div>
        </div>

        {/* Question */}
        <div style={{ flex: 1, maxWidth: 760, margin: '0 auto', padding: '2.5rem 1.5rem 6rem', width: '100%' }}>
          <div className="glass fade-up" style={{ padding: '1.75rem', marginBottom: '1rem' }} key={currentQ}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-faint)', marginBottom: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Question {currentQ + 1}
            </div>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.75, color: 'var(--text)', whiteSpace: 'pre-line' }}>
              {q.text}
            </p>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '2rem' }}>
            {OPTS.map(key => {
              const selected = answers[q.id] === key
              return (
                <button
                  key={key}
                  onClick={() => handleAnswer(q.id, key)}
                  className={`option${selected ? ' selected' : ''}`}
                >
                  <span className="opt-badge">{key}</span>
                  <span style={{ flex: 1 }}>{optText(q, key)}</span>
                </button>
              )
            })}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            {currentQ > 0 && (
              <button onClick={() => setCurrentQ(n => n - 1)} className="btn btn-ghost btn-sm">
                ← Prev
              </button>
            )}
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
              {answered}/{test.questions.length} answered
            </span>
            {!isLast ? (
              <button onClick={() => setCurrentQ(n => n + 1)} className="btn btn-primary btn-sm">
                Next →
              </button>
            ) : (
              <button onClick={submitAnswers} disabled={submitting} className="btn btn-primary btn-sm">
                {submitting ? 'Submitting…' : 'Submit'}
              </button>
            )}
          </div>

          {/* Question grid */}
          <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.375rem', justifyContent: 'center' }}>
            {test.questions.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setCurrentQ(i)}
                style={{
                  width: 30, height: 30, borderRadius: 6,
                  fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer', border: 'none',
                  background: i === currentQ ? 'var(--accent)' : answers[item.id] ? 'var(--accent-dim)' : 'var(--surface-hi)',
                  color: i === currentQ ? '#fff' : answers[item.id] ? 'var(--accent-2)' : 'var(--text-faint)',
                  transition: 'all 0.15s',
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  /* ── MODULE 1 DONE ──────────────────────────────────────────────────── */
  if (phase === 'module1Done' && result) {
    const pct = result.percentage
    const color = pct >= 80 ? '#34D399' : pct >= 60 ? '#FBBF24' : '#F87171'

    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }} className="fade-up">
          {/* Score ring-like display */}
          <div style={{
            width: 120, height: 120, borderRadius: '50%',
            border: `3px solid ${color}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 2rem',
            boxShadow: `0 0 40px ${color}30`,
          }}>
            <span style={{ fontSize: '2rem', fontWeight: 700, color, lineHeight: 1 }}>{pct}%</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-faint)', marginTop: 2 }}>score</span>
          </div>

          <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.375rem' }}>
            Module 1 Complete
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            {result.score} of {result.totalQuestions} correct · SAT {test.year} {sectionLabel(test.section)}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
            <button
              onClick={() => setPhase('review')}
              className="btn btn-ghost btn-lg"
              style={{ justifyContent: 'center' }}
            >
              Review answers
            </button>
            <button
              onClick={() => router.push(`/practice-tests/${test.companionModuleId}`)}
              className="btn btn-primary btn-lg"
              style={{ justifyContent: 'center' }}
            >
              Module 2 →
            </button>
          </div>

          {!session && (
            <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-faint)' }}>
              <Link href="/auth/signin" style={{ color: 'var(--accent-2)', textDecoration: 'none' }}>Sign in</Link> to save your progress
            </p>
          )}
        </div>
      </div>
    )
  }

  /* ── REVIEW ─────────────────────────────────────────────────────────── */
  if (phase === 'review' && result) {
    return (
      <div style={{ minHeight: '100dvh' }}>
        <div style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(7,7,17,0.85)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)', padding: '0 1.5rem',
        }}>
          <div style={{ maxWidth: 760, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>Module 1 Review</span>
              <span style={{ marginLeft: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {result.score}/{result.totalQuestions} correct
              </span>
            </div>
            {test.companionModuleId && (
              <button
                onClick={() => router.push(`/practice-tests/${test.companionModuleId}`)}
                className="btn btn-primary btn-sm"
              >
                Continue to Module 2 →
              </button>
            )}
          </div>
        </div>

        <div style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1.5rem 4rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {test.questions.map((q, i) => {
            const d = result.detailedAnswers.find(a => a.questionId === q.id)
            const ok = d?.isCorrect
            return (
              <div key={q.id} className={ok ? 'review-correct' : 'review-wrong'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: ok ? 'var(--green)' : 'var(--red)' }}>
                    {ok ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-faint)' }}>Q{i + 1}</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.7, marginBottom: '0.75rem', whiteSpace: 'pre-line' }}>
                  {q.text}
                </p>
                {!ok && d?.userAnswer && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--red)', marginBottom: '0.25rem' }}>
                    Your answer: {d.userAnswer}. {optText(q, d.userAnswer)}
                  </p>
                )}
                <p style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: 500, marginBottom: q.explanation ? '0.625rem' : 0 }}>
                  Correct: {d?.correctAnswer}. {d ? optText(q, d.correctAnswer) : ''}
                </p>
                {q.explanation && (
                  <div style={{
                    marginTop: '0.625rem', padding: '0.75rem 1rem',
                    background: 'var(--surface)', borderRadius: 8,
                    fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6,
                  }}>
                    {q.explanation}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {test.companionModuleId && (
          <div style={{
            position: 'sticky', bottom: 0, background: 'rgba(7,7,17,0.9)', backdropFilter: 'blur(20px)',
            borderTop: '1px solid var(--border)', padding: '1rem 1.5rem',
          }}>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
              <button
                onClick={() => router.push(`/practice-tests/${test.companionModuleId}`)}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Continue to Module 2 →
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  /* ── RESULTS ────────────────────────────────────────────────────────── */
  if (phase === 'results' && result) {
    const pct = result.percentage
    const color = pct >= 80 ? '#34D399' : pct >= 60 ? '#FBBF24' : '#F87171'

    return (
      <div style={{ minHeight: '100dvh' }}>
        <nav className="navbar">
          <div className="navbar-inner">
            <Link href={`/mock-tests/${test.year}`} style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              {test.year} tests
            </Link>
            <span className="logo">Purple<span>Book</span></span>
          </div>
        </nav>

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
          {/* Score header */}
          <div className="fade-up" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{
              width: 140, height: 140, borderRadius: '50%',
              border: `4px solid ${color}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: `0 0 60px ${color}28`,
            }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 700, color, lineHeight: 1 }}>{pct}%</span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-faint)', marginTop: 3 }}>score</span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>
              Module {test.moduleNumber} Complete
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              {result.score} of {result.totalQuestions} correct · SAT {test.year} {sectionLabel(test.section)}
            </p>

            <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => { setPhase('intro'); setAnswers({}); setCurrentQ(0); setResult(null) }}
                className="btn btn-ghost"
              >
                Retake
              </button>
              <Link href={`/mock-tests/${test.year}`} className="btn btn-primary">
                Back to {test.year}
              </Link>
            </div>
          </div>

          {/* Telegram */}
          <div className="glass fade-up-d1" style={{ padding: '1.375rem 1.5rem', display: 'flex', gap: '1.125rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10, background: 'rgba(42,171,238,0.15)',
              border: '1px solid rgba(42,171,238,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0, flexShrink: 0,
            }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#2AABEE">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 14.617l-2.96-.924c-.64-.203-.657-.64.136-.954l11.57-4.461c.537-.194 1.006.131.828.943z"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.25rem' }}>
                Share your score
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                Screenshot this page and send it to our Telegram channel.
              </p>
              <a href={TELEGRAM} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                  fontSize: '0.8125rem', fontWeight: 600, color: '#2AABEE', textDecoration: 'none',
                }}>
                Open @purplebook_sat →
              </a>
            </div>
          </div>

          {/* Certificate */}
          {result.certificateDbId && (
            <div className="glass fade-up-d2" style={{ padding: '1.375rem 1.5rem', border: '1px solid rgba(251,191,36,0.25)', background: 'rgba(251,191,36,0.06)', marginBottom: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontWeight: 700, color: '#FCD34D', marginBottom: '0.25rem' }}>Certificate Earned</div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.875rem' }}>
                Your completion certificate is ready.
              </p>
              <a href={`/api/certificates/${result.certificateDbId}/download`} download
                className="btn btn-primary btn-sm"
                style={{ background: '#D97706', boxShadow: 'none' }}>
                Download Certificate
              </a>
            </div>
          )}

          {/* Review */}
          <div className="fade-up-d2">
            <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-faint)', marginBottom: '1rem' }}>
              Review answers
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {test.questions.map((q, i) => {
                const d = result.detailedAnswers.find(a => a.questionId === q.id)
                const ok = d?.isCorrect
                return (
                  <div key={q.id} className={ok ? 'review-correct' : 'review-wrong'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: ok ? 'var(--green)' : 'var(--red)' }}>
                        {ok ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-faint)' }}>Q{i + 1}</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.7, marginBottom: '0.625rem', whiteSpace: 'pre-line' }}>
                      {q.text}
                    </p>
                    {!ok && d?.userAnswer && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--red)', marginBottom: '0.2rem' }}>
                        Your answer: {d.userAnswer}. {optText(q, d.userAnswer)}
                      </p>
                    )}
                    <p style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: 500, marginBottom: q.explanation ? '0.625rem' : 0 }}>
                      Correct: {d?.correctAnswer}. {d ? optText(q, d.correctAnswer) : ''}
                    </p>
                    {q.explanation && (
                      <div style={{
                        marginTop: '0.5rem', padding: '0.75rem',
                        background: 'var(--surface)', borderRadius: 8,
                        fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6,
                      }}>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
