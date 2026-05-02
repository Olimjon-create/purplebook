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
  timeLimit: number
  _count: { questions: number }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    const fetchTests = async () => {
      const res = await fetch('/api/practice-tests')
      if (res.ok) {
        const data = await res.json()
        setTests(data.slice(0, 6))
      }
      setLoading(false)
    }
    if (session) fetchTests()
  }, [session])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!session) return null

  const difficultyColor = (d: string) =>
    d === 'easy' ? 'bg-green-100 text-green-700' :
    d === 'hard' ? 'bg-red-100 text-red-700' :
    'bg-yellow-100 text-yellow-700'

  return (
    <div className="min-h-screen bg-purple-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Welcome */}
        <div className="mb-10 fade-in">
          <h1 className="text-4xl font-bold text-purple-950" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            Welcome back, {session.user?.name?.split(' ')[0] || 'student'} 👋
          </h1>
          <p className="text-gray-500 mt-2">Ready to sharpen your knowledge today?</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: '📝', label: 'Available Tests', value: tests.length + '+' },
            { icon: '🎯', label: 'Subjects Covered', value: [...new Set(tests.map(t => t.subject))].length + '+' },
            { icon: '⚡', label: 'Avg. Time', value: '15 min' },
          ].map((stat, i) => (
            <div key={i} className="card fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-purple-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Practice Tests Section */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-purple-950" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            Practice Tests
          </h2>
          <Link href="/practice-tests" className="text-sm text-purple-700 font-medium hover:text-purple-900">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-3 w-3/4" />
                <div className="h-3 bg-gray-100 rounded mb-4 w-1/2" />
                <div className="h-8 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : tests.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-500">No tests yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map((test, i) => (
              <div
                key={test.id}
                className="card hover:border-purple-200 hover:shadow-md transition-all duration-200 fade-in flex flex-col"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`tag ${difficultyColor(test.difficulty)}`}>
                    {test.difficulty}
                  </span>
                  <span className="text-xs text-gray-400">{test.timeLimit} min</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{test.title}</h3>
                <p className="text-xs text-purple-700 font-medium mb-4">{test.subject}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-gray-400">{test._count.questions} questions</span>
                  <Link
                    href={`/practice-tests/${test.id}`}
                    className="text-sm font-medium text-purple-700 hover:text-purple-900 hover:underline"
                  >
                    Start →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 bg-gradient-to-r from-purple-700 to-purple-900 rounded-2xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              Browse all practice tests
            </h3>
            <p className="text-purple-200 text-sm">Filter by subject, difficulty, and time</p>
          </div>
          <Link
            href="/practice-tests"
            className="shrink-0 bg-white text-purple-800 font-semibold px-6 py-3 rounded-xl hover:bg-purple-50 transition-colors"
          >
            Browse Tests →
          </Link>
        </div>
      </div>
    </div>
  )
}
