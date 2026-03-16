import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

const collegeName = 'Government Engineering College, Modasa';

const getLogoPath = () => path.resolve(process.cwd(), 'assets', 'college-logo.png');

const buildHeader = (doc, logoBuffer, layout) => {
  const { left, right, top, contentWidth, pageWidth } = layout;
  const logoWidth = 64;
  const headerTop = top;

  if (logoBuffer) {
    const logoX = (pageWidth - logoWidth) / 2;
    doc.image(logoBuffer, logoX, headerTop, { width: logoWidth });
  }

  const nameY = headerTop + 78;
  doc.fontSize(18).fillColor('#111827');
  const nameHeight = doc.heightOfString(collegeName, { width: contentWidth, align: 'center' });
  doc.text(collegeName, left, nameY, { width: contentWidth, align: 'center' });

  const dividerY = nameY + nameHeight + 6;
  doc
    .moveTo(left, dividerY)
    .lineTo(right, dividerY)
    .strokeColor('#e5e7eb')
    .stroke();

  doc.y = dividerY + 24;
};

const buildMetadata = (doc, request, layout) => {
  const { left, contentWidth } = layout;
  const meta = [
    `Faculty: ${request.facultyId?.name || 'Faculty'}`,
    `Student: ${request.studentId?.name || 'Student'}`,
    `Enrollment: ${request.studentId?.enrollment || '-'}`,
    `Email: ${request.studentId?.email || '-'}`,
    `Subject: ${request.subject || '-'}`,
    `Program: ${request.program || '-'}`,
    `Target University: ${request.targetUniversity || '-'}`,
    `Purpose: ${request.purpose || '-'}`
  ];

  doc.fontSize(11).fillColor('#111827');
  meta.forEach((line) => {
    doc.text(line, left, doc.y, { width: contentWidth, align: 'left' });
  });

  doc.moveDown(1);
};

const buildBody = (doc, request, layout) => {
  const { left, contentWidth } = layout;
  const facultyName = request.facultyId?.name || 'Faculty';
  const studentName = request.studentId?.name || 'Student';
  const enrollment = request.studentId?.enrollment || '-';
  const studentEmail = request.studentId?.email || '-';
  const targetUniversity = request.targetUniversity || '-';
  const program = request.program || '-';
  const subject = request.subject || '-';
  const purpose = request.purpose || '-';
  const achievements = request.achievements || '-';
  const requirements = request.lorRequirements || '-';

  doc
    .fontSize(12)
    .fillColor('#111827')
    .text('To Whom It May Concern,', left, doc.y, {
      width: contentWidth,
      align: 'left'
    });

  doc.moveDown(1);

  const paragraphOne = `This letter is to recommend ${studentName} (Enrollment: ${enrollment}, Email: ${studentEmail}) ` +
    `for admission to ${targetUniversity} in the ${program} program. ${studentName} completed ${subject} ` +
    `under my supervision. The student has requested this letter for the following purpose: ${purpose}.`;

  doc.text(paragraphOne, {
    width: contentWidth,
    align: 'justify'
  });

  doc.moveDown(0.8);

  const paragraphTwo = `Notable achievements and highlights include: ${achievements}. ` +
    `Additional points to include in this letter: ${requirements}.`;

  doc.text(paragraphTwo, {
    width: contentWidth,
    align: 'justify'
  });

  doc.moveDown(1.4);

  doc.text('Sincerely,', {
    width: contentWidth,
    align: 'left'
  });

  doc.moveDown(2.2);

  doc.text(facultyName, {
    width: contentWidth,
    align: 'left'
  });
};

export const generateLorPdfBuffer = async (request) => {
  const logoPath = getLogoPath();
  const logoBuffer = fs.existsSync(logoPath) ? fs.readFileSync(logoPath) : null;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];

    const pageWidth = doc.page.width;
    const left = 90;
    const right = pageWidth - 90;
    const contentWidth = right - left;
    const layout = {
      top: 70,
      left,
      right,
      contentWidth,
      pageWidth
    };

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    buildHeader(doc, logoBuffer, layout);
    buildMetadata(doc, request, layout);
    buildBody(doc, request, layout);

    doc.end();
  });
};
