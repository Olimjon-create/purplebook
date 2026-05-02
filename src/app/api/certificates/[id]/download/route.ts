import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateCertificatePDF } from '@/lib/certificate-pdf'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cert = await prisma.certificate.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { name: true, email: true } },
        testResult: { select: { score: true, totalQuestions: true, timeTaken: true, completedAt: true } },
        practiceTest: { select: { title: true } },
      },
    })

    if (!cert) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    // Only the owner may download their certificate
    if (cert.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const pdfBytes = await generateCertificatePDF({
      studentName: cert.user.name ?? cert.user.email ?? 'Student',
      testTitle: cert.practiceTest.title,
      completionDate: cert.testResult.completedAt,
      scorePercentage: Math.round((cert.testResult.score / cert.testResult.totalQuestions) * 100),
      certificateId: cert.certificateId,
      timeTaken: cert.testResult.timeTaken,
    })

    const safeTitle = cert.practiceTest.title.replace(/[^a-z0-9]/gi, '_').slice(0, 40)
    const filename = `certificate_${safeTitle}.pdf`

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBytes.length.toString(),
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 })
  }
}
