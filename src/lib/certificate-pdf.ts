import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

interface CertificateData {
  studentName: string
  testTitle: string
  completionDate: Date
  scorePercentage: number
  certificateId: string
  timeTaken: number | null
}

// A4 landscape dimensions in points
const W = 841.89
const H = 595.28

function center(text: string, font: { widthOfTextAtSize: (t: string, s: number) => number }, size: number): number {
  return (W - font.widthOfTextAtSize(text, size)) / 2
}

export async function generateCertificatePDF(data: CertificateData): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const page = doc.addPage([W, H])

  const serif     = await doc.embedFont(StandardFonts.TimesRoman)
  const serifBold = await doc.embedFont(StandardFonts.TimesRomanBold)
  const sans      = await doc.embedFont(StandardFonts.Helvetica)
  const sansBold  = await doc.embedFont(StandardFonts.HelveticaBold)

  const darkPurple = rgb(0.149, 0.043, 0.361)  // #260B5C
  const purple     = rgb(0.486, 0.196, 0.937)  // #7C32EF
  const gold       = rgb(0.855, 0.647, 0.125)  // #DAA520
  const white      = rgb(1, 1, 1)
  const gray       = rgb(0.42, 0.42, 0.42)
  const lightGray  = rgb(0.72, 0.72, 0.72)

  // ── Outer border (dark purple, 3pt) ──────────────────────────────────────
  page.drawRectangle({
    x: 15, y: 15, width: W - 30, height: H - 30,
    borderColor: darkPurple, borderWidth: 3,
    color: white,
  })

  // ── Header background ─────────────────────────────────────────────────────
  // Sits inside the outer border top: y = 488 to y = 568
  page.drawRectangle({
    x: 25, y: 488, width: W - 50, height: 80,
    color: darkPurple,
  })

  // ── Inner gold border (drawn on top of header so it overlaps cleanly) ────
  page.drawRectangle({
    x: 25, y: 25, width: W - 50, height: H - 50,
    borderColor: gold, borderWidth: 1.5,
  })

  // ── Corner gold diamonds ──────────────────────────────────────────────────
  const cornerSize = 7
  const corners: [number, number][] = [
    [25, 25], [W - 25 - cornerSize, 25],
    [25, H - 25 - cornerSize], [W - 25 - cornerSize, H - 25 - cornerSize],
  ]
  for (const [cx, cy] of corners) {
    page.drawRectangle({ x: cx, y: cy, width: cornerSize, height: cornerSize, color: gold })
  }

  // ── "PURPLEBOOK" logo ─────────────────────────────────────────────────────
  const logoText = 'PURPLEBOOK'
  page.drawText(logoText, {
    x: center(logoText, serifBold, 32), y: 535,
    size: 32, font: serifBold, color: white,
  })

  // ── Platform subtitle ─────────────────────────────────────────────────────
  const subText = 'SAT PREPARATION PLATFORM'
  page.drawText(subText, {
    x: center(subText, sans, 11), y: 503,
    size: 11, font: sans, color: gold,
  })

  // ── "CERTIFICATE OF COMPLETION" ───────────────────────────────────────────
  const certTitle = 'CERTIFICATE OF COMPLETION'
  page.drawText(certTitle, {
    x: center(certTitle, serifBold, 26), y: 448,
    size: 26, font: serifBold, color: darkPurple,
  })

  // ── Double gold divider ───────────────────────────────────────────────────
  page.drawLine({ start: { x: 80, y: 430 }, end: { x: W - 80, y: 430 }, thickness: 1.5, color: gold })
  page.drawLine({ start: { x: 80, y: 426 }, end: { x: W - 80, y: 426 }, thickness: 0.5, color: gold })

  // ── "This is to certify that" ─────────────────────────────────────────────
  const certifyText = 'This is to certify that'
  page.drawText(certifyText, {
    x: center(certifyText, serif, 13), y: 405,
    size: 13, font: serif, color: gray,
  })

  // ── Student name ──────────────────────────────────────────────────────────
  const rawName = data.studentName?.trim() || 'Student'
  const studentName = rawName.length > 42 ? rawName.slice(0, 40) + '…' : rawName
  const nameSize = rawName.length > 28 ? 28 : 36
  const nameX = center(studentName, serifBold, nameSize)
  const nameW = serifBold.widthOfTextAtSize(studentName, nameSize)
  page.drawText(studentName, {
    x: nameX, y: 368,
    size: nameSize, font: serifBold, color: darkPurple,
  })

  // ── Name underline ────────────────────────────────────────────────────────
  page.drawLine({
    start: { x: nameX - 6, y: 358 },
    end:   { x: nameX + nameW + 6, y: 358 },
    thickness: 1, color: gold,
  })

  // ── "has successfully completed" ──────────────────────────────────────────
  const completedText = 'has successfully completed'
  page.drawText(completedText, {
    x: center(completedText, serif, 13), y: 334,
    size: 13, font: serif, color: gray,
  })

  // ── Test title ────────────────────────────────────────────────────────────
  const rawTitle = data.testTitle || 'Practice Test'
  const testTitle = rawTitle.length > 58 ? rawTitle.slice(0, 56) + '…' : rawTitle
  const titleSize = rawTitle.length > 40 ? 16 : 20
  page.drawText(testTitle, {
    x: center(testTitle, serifBold, titleSize), y: 304,
    size: titleSize, font: serifBold, color: purple,
  })

  // ── Score / Time / Date row ───────────────────────────────────────────────
  const scoreText = `Score: ${data.scorePercentage}%`
  page.drawText(scoreText, {
    x: 110, y: 270,
    size: 13, font: sansBold, color: darkPurple,
  })

  if (data.timeTaken && data.timeTaken > 0) {
    const mins = Math.floor(data.timeTaken / 60)
    const secs = data.timeTaken % 60
    const timeStr = secs > 0 ? `${mins}m ${secs}s` : `${mins} min`
    const timeText = `Time: ${timeStr}`
    page.drawText(timeText, {
      x: center(timeText, sans, 12), y: 270,
      size: 12, font: sans, color: gray,
    })
  }

  const dateFormatted = data.completionDate.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const dateText = `Completed: ${dateFormatted}`
  const dateTextW = sansBold.widthOfTextAtSize(dateText, 13)
  page.drawText(dateText, {
    x: W - 110 - dateTextW, y: 270,
    size: 13, font: sansBold, color: darkPurple,
  })

  // ── Separator ─────────────────────────────────────────────────────────────
  page.drawLine({ start: { x: 80, y: 248 }, end: { x: W - 80, y: 248 }, thickness: 0.5, color: lightGray })

  // ── Left signature line ───────────────────────────────────────────────────
  const sigY = 172
  page.drawLine({ start: { x: 100, y: sigY }, end: { x: 290, y: sigY }, thickness: 1, color: gray })
  const sigLabel = 'Authorized Signature'
  const sigLabelW = sans.widthOfTextAtSize(sigLabel, 10)
  page.drawText(sigLabel, {
    x: (100 + 290 - sigLabelW) / 2, y: sigY - 14,
    size: 10, font: sans, color: gray,
  })

  // ── Official seal (double ellipse) ────────────────────────────────────────
  const sealX = W / 2
  const sealY = sigY
  page.drawEllipse({ x: sealX, y: sealY, xScale: 40, yScale: 40, borderColor: gold, borderWidth: 2 })
  page.drawEllipse({ x: sealX, y: sealY, xScale: 33, yScale: 33, borderColor: gold, borderWidth: 0.5 })
  const seal1 = 'OFFICIAL'
  page.drawText(seal1, {
    x: sealX - sansBold.widthOfTextAtSize(seal1, 8) / 2, y: sealY + 7,
    size: 8, font: sansBold, color: gold,
  })
  const seal2 = 'SEAL'
  page.drawText(seal2, {
    x: sealX - sansBold.widthOfTextAtSize(seal2, 8) / 2, y: sealY - 9,
    size: 8, font: sansBold, color: gold,
  })

  // ── Right date / issuance line ────────────────────────────────────────────
  page.drawLine({ start: { x: W - 290, y: sigY }, end: { x: W - 100, y: sigY }, thickness: 1, color: gray })
  const dateLbl = 'Date of Issuance'
  const dateLblW = sans.widthOfTextAtSize(dateLbl, 10)
  page.drawText(dateLbl, {
    x: (W - 290 + W - 100 - dateLblW) / 2, y: sigY - 14,
    size: 10, font: sans, color: gray,
  })
  const issuanceDate = data.completionDate.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const issuanceDateW = sans.widthOfTextAtSize(issuanceDate, 10)
  page.drawText(issuanceDate, {
    x: (W - 290 + W - 100 - issuanceDateW) / 2, y: sigY + 14,
    size: 10, font: sans, color: darkPurple,
  })

  // ── Certificate ID footer ─────────────────────────────────────────────────
  const certIdText = `Certificate ID: ${data.certificateId}`
  page.drawText(certIdText, {
    x: center(certIdText, sans, 9), y: 38,
    size: 9, font: sans, color: lightGray,
  })

  return doc.save()
}

export function buildCertificateId(userId: string, testId: string): string {
  const ts = Date.now().toString(36).toUpperCase()
  const u = userId.slice(-5).toUpperCase()
  const t = testId.slice(-5).toUpperCase()
  return `PB-${u}${t}-${ts}`
}
