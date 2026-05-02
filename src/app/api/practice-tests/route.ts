import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const year = searchParams.get('year')

    const where = year ? { year: parseInt(year) } : {}

    const tests = await prisma.practiceTest.findMany({
      where,
      include: { _count: { select: { questions: true } } },
      orderBy: [{ year: 'desc' }, { section: 'asc' }, { moduleNumber: 'asc' }],
    })

    return NextResponse.json(tests)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tests' }, { status: 500 })
  }
}
