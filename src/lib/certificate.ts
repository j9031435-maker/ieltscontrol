import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fs from "fs/promises";
import path from "path";

export interface CertificateSectionScore {
  label: string;
  value: number;
}

export interface CertificateData {
  studentName: string;
  certificateId: string;
  sectionScores: CertificateSectionScore[];
  overallBand: number;
  issuedDate: Date;
}

const GOLD = rgb(0.71, 0.55, 0.16);
const GOLD_DEEP = rgb(0.55, 0.41, 0.1);
const NAVY = rgb(0.114, 0.106, 0.286);
const GRAY = rgb(0.34, 0.39, 0.48);
const CREAM = rgb(0.988, 0.976, 0.949);

function centerText(
  page: PDFPage,
  text: string,
  y: number,
  font: PDFFont,
  size: number,
  color = NAVY
) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: page.getWidth() / 2 - width / 2, y, size, font, color });
}

async function loadPng(pdfDoc: PDFDocument, relPath: string) {
  const bytes = await fs.readFile(path.join(process.cwd(), "public", relPath));
  return pdfDoc.embedPng(bytes);
}

export async function generateCertificatePdf(data: CertificateData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 landscape, points
  const { width, height } = page.getSize();

  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Background
  page.drawRectangle({ x: 0, y: 0, width, height, color: CREAM });

  // Double gold border frame
  const outer = 24;
  page.drawRectangle({
    x: outer,
    y: outer,
    width: width - outer * 2,
    height: height - outer * 2,
    borderColor: GOLD,
    borderWidth: 3,
  });
  const inner = 34;
  page.drawRectangle({
    x: inner,
    y: inner,
    width: width - inner * 2,
    height: height - inner * 2,
    borderColor: GOLD,
    borderWidth: 1,
  });

  // Logo
  const logo = await loadPng(pdfDoc, "certificate/logo.png");
  const logoTargetWidth = 170;
  const logoScale = logoTargetWidth / logo.width;
  const logoW = logo.width * logoScale;
  const logoH = logo.height * logoScale;
  page.drawImage(logo, {
    x: width / 2 - logoW / 2,
    y: 553 - logoH,
    width: logoW,
    height: logoH,
  });

  // Title
  centerText(page, "SERTIFIKAT", 440, timesBold, 30, NAVY);
  centerText(page, "CERTIFICATE OF ACHIEVEMENT", 418, helvetica, 10, GOLD_DEEP);
  const ruleWidth = 150;
  page.drawLine({
    start: { x: width / 2 - ruleWidth / 2, y: 406 },
    end: { x: width / 2 + ruleWidth / 2, y: 406 },
    thickness: 1,
    color: GOLD,
  });

  // Body
  centerText(page, "Ushbu sertifikat quyidagi shaxsga topshiriladi:", 382, timesItalic, 12, GRAY);
  centerText(page, data.studentName, 344, timesBold, 27, NAVY);
  centerText(
    page,
    "IELTS Control platformasida IELTS imtihoniga tayyorgarlik dasturini",
    318,
    timesRoman,
    12,
    GRAY
  );
  centerText(page, "muvaffaqiyatli yakunlagani uchun topshiriladi.", 300, timesRoman, 12, GRAY);

  // Section score chips
  const chipCount = data.sectionScores.length;
  const chipW = 120;
  const chipH = 46;
  const chipGap = 14;
  const totalChipsWidth = chipCount * chipW + (chipCount - 1) * chipGap;
  let chipX = width / 2 - totalChipsWidth / 2;
  const chipY = 246;
  for (const s of data.sectionScores) {
    page.drawRectangle({
      x: chipX,
      y: chipY,
      width: chipW,
      height: chipH,
      borderColor: GOLD,
      borderWidth: 0.75,
      color: rgb(1, 1, 1),
    });
    const valueText = s.value.toFixed(1);
    const valueWidth = helveticaBold.widthOfTextAtSize(valueText, 18);
    page.drawText(valueText, {
      x: chipX + chipW / 2 - valueWidth / 2,
      y: chipY + 27,
      size: 18,
      font: helveticaBold,
      color: NAVY,
    });
    const labelText = s.label.toUpperCase();
    const labelWidth = helvetica.widthOfTextAtSize(labelText, 8.5);
    page.drawText(labelText, {
      x: chipX + chipW / 2 - labelWidth / 2,
      y: chipY + 11,
      size: 8.5,
      font: helvetica,
      color: GRAY,
    });
    chipX += chipW + chipGap;
  }

  // Overall band
  centerText(page, "UMUMIY TAXMINIY BAND", 222, helvetica, 11.5, GOLD_DEEP);
  centerText(page, data.overallBand.toFixed(1), 175, timesBold, 42, GOLD_DEEP);

  // Certificate ID + date (left), signature (right)
  const dateFormatter = new Intl.DateTimeFormat("uz-UZ", { dateStyle: "long" });
  page.drawText(`Sertifikat ID: ${data.certificateId}`, {
    x: inner + 24,
    y: 140,
    size: 9,
    font: helvetica,
    color: GRAY,
  });
  page.drawText(`Berilgan sana: ${dateFormatter.format(data.issuedDate)}`, {
    x: inner + 24,
    y: 126,
    size: 9,
    font: helvetica,
    color: GRAY,
  });

  const sigText = "IELTS Control administratsiyasi";
  const sigWidth = helvetica.widthOfTextAtSize(sigText, 9);
  const sigRight = width - inner - 24;
  page.drawLine({
    start: { x: sigRight - Math.max(sigWidth, 130), y: 148 },
    end: { x: sigRight, y: 148 },
    thickness: 0.75,
    color: GOLD,
  });
  page.drawText(sigText, {
    x: sigRight - sigWidth,
    y: 134,
    size: 9,
    font: helvetica,
    color: GRAY,
  });

  // QR codes — each gets its own fixed-width slot so wide captions never
  // collide with the neighboring QR's caption.
  const tgQr = await loadPng(pdfDoc, "certificate/qr-telegram.png");
  const siteQr = await loadPng(pdfDoc, "certificate/qr-website.png");
  const qrH = 50;
  const tgW = qrH * (tgQr.width / tgQr.height);
  const siteW = qrH * (siteQr.width / siteQr.height);
  const qrY = 60;

  const slotWidth = 180;
  const slotGap = 20;
  const totalSlotWidth = slotWidth * 2 + slotGap;
  const slot1CenterX = width / 2 - totalSlotWidth / 2 + slotWidth / 2;
  const slot2CenterX = slot1CenterX + slotWidth + slotGap;

  page.drawImage(tgQr, { x: slot1CenterX - tgW / 2, y: qrY, width: tgW, height: qrH });
  const tgCaption = "Telegram: @IELTSCONTROLUZ";
  const tgCaptionWidth = helvetica.widthOfTextAtSize(tgCaption, 8);
  page.drawText(tgCaption, {
    x: slot1CenterX - tgCaptionWidth / 2,
    y: qrY - 14,
    size: 8,
    font: helvetica,
    color: GRAY,
  });

  page.drawImage(siteQr, { x: slot2CenterX - siteW / 2, y: qrY, width: siteW, height: qrH });
  const siteCaption = "ieltscontroluz.vercel.app";
  const siteCaptionWidth = helvetica.widthOfTextAtSize(siteCaption, 8);
  page.drawText(siteCaption, {
    x: slot2CenterX - siteCaptionWidth / 2,
    y: qrY - 14,
    size: 8,
    font: helvetica,
    color: GRAY,
  });

  return pdfDoc.save();
}
