'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

interface Test {
  id: string
  title: string
  subject: string
  difficulty: string
  description: string | null
  timeLimit: number
  createdAt: string
  _count: { questions: number }
}

const SUBJECTS = ['All', 'Mathematics', 'Science', 'History', 'English', 'Geography', 'Computer Science', 'Physics', 'Chemistry', 'Biology']
const DIFFICULTIES = ['All', 'easy', 'medium', 'hard']

export default function PracticeTestsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState('All')
  const [difficulty, setDifficulty] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
  }, [status, router])

  useEffect(() => {
    const fetchTests = async () => {
      const res = await fetch('/api/practice-tests')
      if (res.ok) setTests(await res.json())
      setLoading(false)
    }
    if (session) fetchTests()
  }, [session])

  const filtered = tests.filter(t => {
    const matchSubject = subject === 'All' || t.subject === subject
    const matchDiff = difficulty === 'All' || t.difficulty === difficulty
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase())
    return matchSubject && matchDiff && matchSearch
  })

  const difficultyColor = (d: string) =>
    d === 'easy' ? 'bg-green-100 text-green-700' :
    d === 'hard' ? 'bg-red-100 text-red-700' :
    'bg-yellow-100 text-yellow-700'

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
    </div>
  )

  if (!session) return null

  return (
    <div className="min-h-screen bg-purple-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8 fade-in">
          <h1 className="text-4xl font-bold text-purple-950" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            Practice Tests
          </h1>
          <p className="text-gray-500 mt-2">Choose a test and start practicing</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-purple-100 p-4 mb-6 flex flex-wrap gap-3 fade-in">
          <input
            type="text"
            placeholder="Search tests..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field !w-auto flex-1 min-w-[200px] !py-2"
          />

          <select
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="input-field !w-auto !py-2 cursor-pointer"
          >
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            className="input-field !w-auto !py-2 cursor-pointer"
          >
            {DIFFICULTIES.map(d => (
              <option key={d} value={d}>{d === 'All' ? 'All Difficulties' : d.charAt(0).toUpperCase() + d.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Count */}
        <p className="text-sm text-gray-500 mb-4">
          {filtered.length} test{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Tests Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-3 w-3/4" />
                <div className="h-3 bg-gray-100 rounded mb-6 w-1/2" />
                <div className="h-8 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500 font-medium">No tests match your filters</p>
            <button
              onClick={() => { setSearch(''); setSubject('All'); setDifficulty('All') }}
              className="mt-4 text-purple-700 text-sm font-medium hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((test, i) => (
              <div
                key={test.id}
                className="card hover:border-purple-200 hover:shadow-md transition-all duration-200 fade-in flex flex-col"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`tag ${difficultyColor(test.difficulty)}`}>
                    {test.difficulty}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    ⏱ {test.timeLimit} min
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{test.title}</h3>
                <p className="text-xs text-purple-700 font-medium mb-2">{test.subject}</p>

                {test.description && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{test.description}</p>
                )}

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">📝 {test._count.questions} questions</span>
                  <Link
                    href={`/practice-tests/${test.id}`}
                    className="btn-primary !py-2 !px-4 text-sm"
                  >
                    Start Test
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
