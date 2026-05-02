'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-purple-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="text-2xl">📖</span>
            <span className="font-bold text-purple-900 text-lg" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              PurpleBook
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/practice-tests"
              className="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors"
            >
              Practice Tests
            </Link>
            <Link
              href="/certificates"
              className="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors"
            >
              Certificates
            </Link>
          </div>

          {/* User menu */}
          <div className="flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-purple-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-sm font-bold">
                    {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {session.user?.name || session.user?.email}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-purple-100 py-1.5 z-50 slide-up">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-medium text-gray-800 truncate">{session.user?.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        📊 Dashboard
                      </Link>
                      <Link
                        href="/practice-tests"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        📝 Practice Tests
                      </Link>
                      <Link
                        href="/certificates"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        🏅 Certificates
                      </Link>
                      <div className="border-t border-gray-100 mt-1">
                        <button
                          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          🚪 Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/auth/signin" className="btn-secondary text-sm !py-2 !px-4">
                  Sign in
                </Link>
                <Link href="/auth/signup" className="btn-primary text-sm !py-2 !px-4">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
