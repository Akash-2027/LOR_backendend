import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import env from '../../config/env.js';

const COLLEGE_NAME    = 'GOVERNMENT ENGINEERING COLLEGE, MODASA';
const COLLEGE_DISPLAY = 'Government Engineering College, Modasa';
const SUBTITLE        = 'OFFICIAL LETTER OF RECOMMENDATION';
const FOOTER_COPY     = '\u00A9 2026 GEC Modasa';

const C = {
  navy:       '#003366',
  gold:       '#c5a059',
  darkText:   '#111827',
  bodyText:   '#374151',
  midText:    '#4b5563',
  labelText:  '#6b7280',
  subtleText: '#9ca3af',
  border:     '#e5e7eb',
  metaBg:     '#f8fafc'
};

const getLogoPath = () => path.resolve(process.cwd(), 'assets', 'college-logo.png');

/** Strip control characters and cap length to prevent layout manipulation */
const sanitize = (text, maxLen = 500) => {
  if (typeof text !== 'string') return '';
  return text
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '')
    .trim()
    .slice(0, maxLen);
};

/** Returns height needed to render a field label + value */
const fieldHeight = (doc, label, value, width) => {
  const lh = doc.font('Helvetica').fontSize(9).heightOfString(label, { width });
  const vh = doc.font('Helvetica-Bold').fontSize(11).heightOfString(value, { width });
  return lh + 2 + vh + 10;
};

/** Draws label + bold value. Returns new y after the field. */
const drawField = (doc, label, value, x, y, width) => {
  const lh = doc.font('Helvetica').fontSize(9).heightOfString(label, { width });
  doc.font('Helvetica').fontSize(9).fillColor(C.labelText).text(label, x, y, { width });
  doc.font('Helvetica-Bold').fontSize(11).fillColor(C.darkText).text(value, x, y + lh + 2, { width });
  const vh = doc.font('Helvetica-Bold').fontSize(11).heightOfString(value, { width });
  return y + lh + 2 + vh + 10;
};

/** Draws a bullet item with a gold dot. Returns new y. */
const drawBullet = (doc, text, lPad, y, cW) => {
  const textX = lPad + 22;
  const textW = cW - 22;
  doc.font('Helvetica').fontSize(13).fillColor(C.gold).text('\u2022', lPad + 8, y + 1, { lineBreak: false, width: 14 });
  doc.font('Helvetica').fontSize(11).fillColor(C.bodyText).text(text, textX, y, { width: textW, lineGap: 3 });
  return doc.y + 10;
};

export const generateLorPdfBuffer = async (request, verificationToken = null) => {
  const logoPath   = getLogoPath();
  const logoBuffer = fs.existsSync(logoPath) ? fs.readFileSync(logoPath) : null;

  // Pre-generate QR code buffer if a verification token is provided
  let qrBuffer = null;
  if (verificationToken) {
    const verifyUrl = `${env.clientBaseUrl}/verify/${verificationToken}`;
    qrBuffer = await QRCode.toBuffer(verifyUrl, { type: 'png', width: 150, margin: 1 });
  }

  return new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true });
    const chunks = [];

    doc.on('data',  (c) => chunks.push(c));
    doc.on('end',   ()  => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const PW   = doc.page.width;    // 595.28
    const PH   = doc.page.height;   // 841.89
    const lPad = 50;
    const cW   = PW - lPad * 2;    // ~495

    // ── Request data (sanitized to strip control chars) ───────────────
    const studentName     = sanitize(request.studentId?.name,       100) || 'Student';
    const enrollment      = sanitize(request.studentId?.enrollment,  50) || '-';
    const studentEmail    = sanitize(request.studentId?.email,      100) || '-';
    const program         = sanitize(request.program,               200) || '-';
    const targetUni       = sanitize(request.targetUniversity,      200) || '-';
    const purpose         = sanitize(request.purpose,               300) || '-';
    const facultyName     = sanitize(request.facultyId?.name,       100) || 'Faculty';
    const facultyDept     = sanitize(request.facultyId?.department, 100) || 'Department Faculty';
    const achievements    = sanitize(request.achievements,          500) || '-';
    const requirements    = sanitize(request.lorRequirements,       500) || '';

    // ── 1. Navy accent bar ────────────────────────────────────────────
    doc.rect(0, 0, PW, 8).fillColor(C.navy).fill();

    // ── 2. Institutional Header ───────────────────────────────────────
    let y = 18;

    if (logoBuffer) {
      const logoW = 58;
      doc.image(logoBuffer, (PW - logoW) / 2, y, { width: logoW });
      y += 68;
    } else {
      y += 8;
    }

    doc.font('Helvetica-Bold').fontSize(13).fillColor(C.navy);
    doc.text(COLLEGE_NAME, lPad, y, { width: cW, align: 'center', characterSpacing: 1.4 });
    y += doc.heightOfString(COLLEGE_NAME, { width: cW, characterSpacing: 1.4 }) + 6;

    doc.font('Helvetica').fontSize(8).fillColor(C.subtleText);
    doc.text(SUBTITLE, lPad, y, { width: cW, align: 'center', characterSpacing: 1.1 });
    y += 18;

    // Header divider
    doc.moveTo(0, y).lineTo(PW, y).strokeColor(C.border).lineWidth(0.5).stroke();

    // ── 3. Recipient & Meta Section ───────────────────────────────────
    const colGap = 32;
    const colW   = (cW - colGap) / 2;
    const col2X  = lPad + colW + colGap;

    // Pre-calculate meta section height so we can draw the bg first
    const metaTopPad = 24;
    const metaBotPad = 20;
    let leftH  = metaTopPad + 16; // section heading
    leftH  += fieldHeight(doc, 'Name', studentName, colW);
    leftH  += fieldHeight(doc, 'Enrollment No.', enrollment, colW);
    leftH  += fieldHeight(doc, 'Email', studentEmail, colW);

    let rightH = metaTopPad + 16;
    rightH += fieldHeight(doc, 'Current Program', program, colW);
    rightH += fieldHeight(doc, 'Target University', targetUni, colW);
    rightH += fieldHeight(doc, 'Purpose', purpose, colW);

    const metaH      = Math.max(leftH, rightH) + metaBotPad;
    const metaTop    = y;
    const metaBottom = metaTop + metaH;

    // Meta background
    doc.rect(0, metaTop, PW, metaH).fillColor(C.metaBg).fill();
    // Redraw top border (it was drawn before bg)
    doc.moveTo(0, metaTop).lineTo(PW, metaTop).strokeColor(C.border).lineWidth(0.5).stroke();

    // Left column
    let leftY  = metaTop + metaTopPad;
    doc.font('Helvetica-Bold').fontSize(8).fillColor(C.gold);
    doc.text('STUDENT INFORMATION', lPad, leftY, { width: colW, characterSpacing: 0.8 });
    leftY += 16;
    leftY = drawField(doc, 'Name',           studentName,  lPad, leftY, colW);
    leftY = drawField(doc, 'Enrollment No.', enrollment,   lPad, leftY, colW);
    leftY = drawField(doc, 'Email',          studentEmail, lPad, leftY, colW);

    // Right column
    let rightY = metaTop + metaTopPad;
    doc.font('Helvetica-Bold').fontSize(8).fillColor(C.gold);
    doc.text('ACADEMIC CONTEXT', col2X, rightY, { width: colW, characterSpacing: 0.8 });
    rightY += 16;
    rightY = drawField(doc, 'Current Program',  program, col2X, rightY, colW);
    rightY = drawField(doc, 'Target University', targetUni, col2X, rightY, colW);
    rightY = drawField(doc, 'Purpose',           purpose, col2X, rightY, colW);

    // Meta bottom divider
    doc.moveTo(0, metaBottom).lineTo(PW, metaBottom).strokeColor(C.border).lineWidth(0.5).stroke();
    y = metaBottom;

    // ── 4. Letter Body ────────────────────────────────────────────────
    y += 32;

    // Salutation
    doc.font('Helvetica-Bold').fontSize(13).fillColor(C.darkText);
    doc.text('To Whom It May Concern,', lPad, y, { width: cW });
    y = doc.y + 16;

    // Opening paragraph
    const para = `This letter is to recommend ${studentName} (Enrollment: ${enrollment}, Email: ${studentEmail}) for admission to ${targetUni} in the ${program} program. The student has requested this letter for the following purpose: ${purpose}.`;
    doc.font('Helvetica').fontSize(11).fillColor(C.bodyText);
    doc.text(para, lPad, y, { width: cW, lineGap: 4, align: 'justify' });
    y = doc.y + 14;

    // Achievements intro
    doc.font('Helvetica').fontSize(11).fillColor(C.bodyText);
    doc.text('Notable achievements and highlights include:', lPad, y, { width: cW });
    y = doc.y + 12;

    // Bullet list — gold left border drawn afterwards
    const bulletStartY = y;

    y = drawBullet(doc, achievements, lPad, y, cW);
    if (requirements && requirements.trim().length > 1) {
      y = drawBullet(doc, requirements, lPad, y, cW);
    }

    const bulletEndY = y - 6;

    // Gold left border for bullet section
    doc.rect(lPad, bulletStartY - 2, 2, bulletEndY - bulletStartY + 4)
      .fillColor(C.gold)
      .fill();

    // ── 5. Closing / Signature ────────────────────────────────────────
    y += 18;

    doc.font('Helvetica').fontSize(11).fillColor(C.midText);
    doc.text('Sincerely,', lPad, y, { width: cW });
    y = doc.y + 34;

    // Short divider line
    doc.moveTo(lPad, y).lineTo(lPad + 44, y).strokeColor(C.border).lineWidth(1).stroke();

    // Faculty signature block
    const sigX = lPad + 58;
    const sigW = 280;
    y -= 4;

    doc.font('Helvetica-Bold').fontSize(15).fillColor(C.navy);
    doc.text(facultyName, sigX, y, { width: sigW });
    y = doc.y + 3;

    doc.font('Helvetica').fontSize(10).fillColor(C.labelText);
    doc.text(facultyDept, sigX, y, { width: sigW });
    y = doc.y + 3;

    doc.font('Helvetica').fontSize(9).fillColor(C.subtleText);
    doc.text(COLLEGE_DISPLAY, sigX, y, { width: sigW });

    // ── 6. Footer ─────────────────────────────────────────────────────
    const qrSize  = 60;
    const footerY = qrBuffer ? PH - 44 - qrSize - 12 : PH - 44;

    doc.moveTo(0, footerY).lineTo(PW, footerY).strokeColor(C.border).lineWidth(0.5).stroke();

    // QR code — bottom-right corner, below the footer line
    if (qrBuffer) {
      const qrX = PW - lPad - qrSize;
      const qrY = footerY + 6;
      doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });
      doc.font('Helvetica').fontSize(6).fillColor(C.subtleText);
      doc.text('Scan to verify', qrX, qrY + qrSize + 2, { width: qrSize, align: 'center' });
    }

    // Footer text: constrain to safe zone left of the QR code to prevent overlap
    const qrStartX     = PW - lPad - qrSize;        // ~485
    const safeTextW    = qrBuffer ? qrStartX - lPad - 20 : cW; // leave 20px gap before QR

    doc.font('Helvetica').fontSize(8).fillColor(C.subtleText);
    doc.text('OFFICIAL ACADEMIC DOCUMENT', lPad, footerY + 14, { characterSpacing: 0.8, lineBreak: false });
    doc.text(FOOTER_COPY, lPad, footerY + 14, {
      width: safeTextW,
      align: 'right',
      characterSpacing: 0.8
    });

    doc.end();
  });
};
