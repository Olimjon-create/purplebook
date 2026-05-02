import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const certificates = await prisma.certificate.findMany({
      where: { userId: session.user.id },
      include: {
        practiceTest: { select: { title: true, subject: true } },
        testResult: { select: { score: true, totalQuestions: true, timeTaken: true, completedAt: true } },
      },
      orderBy: { issuedAt: 'desc' },
    })

    return NextResponse.json(certificates)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 })
  }
}
