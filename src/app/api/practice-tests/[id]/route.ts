import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { buildCertificateId } from '@/lib/certificate-pdf'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const test = await prisma.practiceTest.findUnique({
      where: { id: params.id },
      include: { questions: { orderBy: { order: 'asc' } } },
    })

    if (!test) return NextResponse.json({ error: 'Test not found' }, { status: 404 })

    // Find companion module (same year + section, opposite moduleNumber)
    let companionModuleId: string | null = null
    if (test.moduleNumber === 1) {
      const companion = await prisma.practiceTest.findFirst({
        where: { year: test.year, section: test.section, moduleNumber: 2 },
        select: { id: true },
      })
      companionModuleId = companion?.id ?? null
    }

    return NextResponse.json({ ...test, companionModuleId })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch test' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { answers, timeTaken } = await req.json()

    const test = await prisma.practiceTest.findUnique({
      where: { id: params.id },
      include: { questions: { orderBy: { order: 'asc' } } },
    })

    if (!test) return NextResponse.json({ error: 'Test not found' }, { status: 404 })

    let score = 0
    const detailedAnswers = test.questions.map((q) => {
      const userAnswer = answers[q.id]
      const isCorrect = userAnswer === q.correctAnswer
      if (isCorrect) score++
      return { questionId: q.id, userAnswer, correctAnswer: q.correctAnswer, isCorrect }
    })

    const result = await prisma.testResult.create({
      data: {
        userId: session.user.id,
        practiceTestId: params.id,
        score,
        totalQuestions: test.questions.length,
        timeTaken,
        answers: JSON.stringify(detailedAnswers),
      },
    })

    const totalCompletions = await prisma.testResult.count({ where: { userId: session.user.id } })

    let certificateDbId: string | null = null
    if (totalCompletions >= 2) {
      const existing = await prisma.certificate.findFirst({
        where: { userId: session.user.id, practiceTestId: params.id },
      })
      if (existing) {
        certificateDbId = existing.id
      } else {
        const newCert = await prisma.certificate.create({
          data: {
            userId: session.user.id,
            testResultId: result.id,
            practiceTestId: params.id,
            certificateId: buildCertificateId(session.user.id, params.id),
          },
        })
        certificateDbId = newCert.id
      }
    }

    return NextResponse.json({
      resultId: result.id,
      score,
      totalQuestions: test.questions.length,
      percentage: Math.round((score / test.questions.length) * 100),
      detailedAnswers,
      certificateDbId,
      testsCompleted: totalCompletions,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to submit test' }, { status: 500 })
  }
}
