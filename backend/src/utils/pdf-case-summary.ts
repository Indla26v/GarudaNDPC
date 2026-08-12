import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

export interface CasePdfData {
  caseInfo: {
    firNo: string;
    psName: string;
    caseDate: string;
    stage: string;
    sectionOfLaw: string;
    contrabandType?: string | null;
    quantity?: string | number | null;
    quantityUnit?: string | null;
    streetValue?: string | number | null;
    sourceLocation?: string | null;
    destinationLocation?: string | null;
    intelligenceNotes?: string | null;
  };
  accusedList: Array<{
    fullName: string;
    alias?: string | null;
    category?: string | null;
    arrestStatus?: string | null;
    arrestDate?: string | null;
    psName?: string | null;
    mobile?: string | null;
    aadhaarNo?: string | null;
    photoBuffer?: Buffer | null;
  }>;
  chargeSheetInfo?: {
    chargeSheetNo?: string | null;
    filingDate?: string | null;
    courtName?: string | null;
    ccStNo?: string | null;
    nextHearingDate?: string | null;
    dispositionSentence?: string | null;
  } | null;
  generatedAt: string;
  generatedBy: string;
  watermark?: string;
}

function applyWatermark(doc: PDFKit.PDFDocument, text: string): void {
  if (!text) return;

  doc.save();
  doc.opacity(0.07);
  doc.fontSize(42);
  doc.font('Helvetica-Bold');
  doc.fillColor('#000000');

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;

  doc.translate(centerX, centerY);
  doc.rotate(-45, { origin: [0, 0] });
  doc.text(text, -250, -20, {
    width: 500,
    align: 'center',
  });

  doc.restore();
}

export function generateCasePdf(data: CasePdfData): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const watermarkText = data.watermark || `${data.generatedBy} | ${data.generatedAt}`;

  // ── Header Banner ──────────────────────────────────────────────────────────
  doc.save();
  doc.rect(40, 40, 515, 50).fill('#1e293b');
  doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold')
     .text('GARUDA — NDPS CASE REPORT', 50, 52, { align: 'center' });
  doc.fontSize(9).font('Helvetica')
     .text('Tirupati District Police & Excise Department', 50, 72, { align: 'center' });
  doc.restore();

  doc.y = 105;

  // ── Case Overview Table ───────────────────────────────────────────────────
  const c = data.caseInfo;
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text('CASE INFORMATION');
  doc.moveDown(0.3);

  const startY = doc.y;
  const tableW = 515;
  const rowH = 20;

  // Background card for case info
  doc.save();
  doc.rect(40, startY, tableW, 110).fill('#f8fafc').stroke('#cbd5e1');
  doc.restore();

  doc.fontSize(9);

  // Left Column
  let yPos = startY + 8;
  const leftX = 50;
  const rightX = 300;

  // FIR Number
  doc.font('Helvetica-Bold').fillColor('#334155').text('FIR Number: ', leftX, yPos, { continued: true });
  doc.font('Helvetica').fillColor('#0f172a').text(c.firNo || '—');

  // Police Station
  doc.font('Helvetica-Bold').fillColor('#334155').text('Police Station: ', rightX, yPos, { continued: true });
  doc.font('Helvetica').fillColor('#0f172a').text(c.psName || '—');

  yPos += rowH;
  // Case Date
  doc.font('Helvetica-Bold').fillColor('#334155').text('Case Date: ', leftX, yPos, { continued: true });
  doc.font('Helvetica').fillColor('#0f172a').text(c.caseDate || '—');

  // Case Stage
  doc.font('Helvetica-Bold').fillColor('#334155').text('Current Stage: ', rightX, yPos, { continued: true });
  doc.font('Helvetica-Bold').fillColor('#b45309').text((c.stage || '—').replace(/_/g, ' '));

  yPos += rowH;
  // Section of Law
  doc.font('Helvetica-Bold').fillColor('#334155').text('Section of Law: ', leftX, yPos, { continued: true });
  doc.font('Helvetica').fillColor('#0f172a').text(c.sectionOfLaw || '—');

  // Contraband
  const qtyStr = c.quantity ? `${c.quantity} ${c.quantityUnit || 'KG'}` : '—';
  doc.font('Helvetica-Bold').fillColor('#334155').text('Contraband: ', rightX, yPos, { continued: true });
  doc.font('Helvetica').fillColor('#0f172a').text(`${c.contrabandType || '—'} (${qtyStr})`);

  yPos += rowH;
  // Street Value
  const valStr = c.streetValue ? `₹${Number(c.streetValue).toLocaleString('en-IN')}` : '—';
  doc.font('Helvetica-Bold').fillColor('#334155').text('Est. Street Value: ', leftX, yPos, { continued: true });
  doc.font('Helvetica').fillColor('#0f172a').text(valStr);

  // Route
  const routeStr = (c.sourceLocation || c.destinationLocation) ? `${c.sourceLocation || '—'} → ${c.destinationLocation || '—'}` : '—';
  doc.font('Helvetica-Bold').fillColor('#334155').text('Route: ', rightX, yPos, { continued: true });
  doc.font('Helvetica').fillColor('#0f172a').text(routeStr);

  doc.y = startY + 125;

  // ── Accused Section ───────────────────────────────────────────────────────
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text(`ACCUSED / SUSPECTS (${data.accusedList.length})`);
  doc.moveDown(0.4);

  if (data.accusedList.length === 0) {
    doc.fontSize(9).font('Helvetica').fillColor('#64748b').text('No accused registered for this case.');
  } else {
    for (let idx = 0; idx < data.accusedList.length; idx++) {
      const acc = data.accusedList[idx];
      if (!acc) continue;

      // Page break check
      if (doc.y + 85 > 760) {
        applyWatermark(doc, watermarkText);
        doc.addPage();
        doc.y = 40;
      }

      const cardY = doc.y;
      const cardH = 75;

      // Accused Card Background Box
      doc.save();
      doc.rect(40, cardY, tableW, cardH).fill('#ffffff').stroke('#e2e8f0');
      doc.restore();

      // Photo Box (Left side: x = 50, y = cardY + 7, w = 60, h = 60)
      const photoX = 48;
      const photoY = cardY + 7;
      const photoW = 60;
      const photoH = 60;

      doc.save();
      doc.rect(photoX, photoY, photoW, photoH).fill('#f1f5f9').stroke('#cbd5e1');
      doc.restore();

      if (acc.photoBuffer) {
        try {
          doc.image(acc.photoBuffer, photoX + 2, photoY + 2, {
            fit: [photoW - 4, photoH - 4],
            align: 'center',
            valign: 'center'
          });
        } catch (imgErr) {
          doc.fontSize(8).font('Helvetica').fillColor('#94a3b8')
             .text('PHOTO', photoX, photoY + 24, { width: photoW, align: 'center' });
        }
      } else {
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#64748b')
           .text('NO PHOTO', photoX, photoY + 24, { width: photoW, align: 'center' });
      }

      // Metadata Details (Right side: x = 120)
      const metaX = 120;
      let textY = cardY + 8;

      // Accused Name & Alias
      const aliasStr = acc.alias ? ` (alias: ${acc.alias})` : '';
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#0f172a')
         .text(`${idx + 1}. ${acc.fullName}${aliasStr}`, metaX, textY);

      textY += 15;
      doc.fontSize(8.5).font('Helvetica');

      // Category & Status
      doc.font('Helvetica-Bold').fillColor('#334155').text('Category: ', metaX, textY, { continued: true });
      doc.font('Helvetica').fillColor('#0f172a').text(`${(acc.category || '—').replace(/_/g, ' ')}   `, { continued: true });
      doc.font('Helvetica-Bold').fillColor('#334155').text('Status: ', { continued: true });
      doc.font('Helvetica-Bold').fillColor('#2563eb').text((acc.arrestStatus || 'POLICE_CUSTODY').replace(/_/g, ' '));

      textY += 14;
      // Arrest Date & PS
      let arrDate = '—';
      if (acc.arrestDate) {
        const d = new Date(acc.arrestDate);
        arrDate = !isNaN(d.getTime()) ? d.toLocaleDateString('en-IN') : String(acc.arrestDate);
      }
      doc.font('Helvetica-Bold').fillColor('#334155').text('Arrest Date: ', metaX, textY, { continued: true });
      doc.font('Helvetica').fillColor('#0f172a').text(`${arrDate}   `, { continued: true });
      doc.font('Helvetica-Bold').fillColor('#334155').text('Station: ', { continued: true });
      doc.font('Helvetica').fillColor('#0f172a').text(acc.psName || '—');

      textY += 14;
      // Mobile & Aadhaar
      doc.font('Helvetica-Bold').fillColor('#334155').text('Mobile: ', metaX, textY, { continued: true });
      doc.font('Helvetica').fillColor('#0f172a').text(`${acc.mobile || '—'}   `, { continued: true });
      doc.font('Helvetica-Bold').fillColor('#334155').text('Aadhaar: ', { continued: true });
      doc.font('Helvetica').fillColor('#0f172a').text(acc.aadhaarNo || '—');

      doc.y = cardY + cardH + 10;
    }
  }

  doc.moveDown(0.5);

  // ── Charge Sheet & Court Section ─────────────────────────────────────────
  if (data.chargeSheetInfo) {
    if (doc.y + 100 > 760) {
      applyWatermark(doc, watermarkText);
      doc.addPage();
      doc.y = 40;
    }

    const cs = data.chargeSheetInfo;
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0f172a').text('CHARGE SHEET & COURT DETAILS');
    doc.moveDown(0.3);

    const csY = doc.y;
    doc.save();
    doc.rect(40, csY, tableW, 65).fill('#f8fafc').stroke('#cbd5e1');
    doc.restore();

    doc.fontSize(9);
    let lineY = csY + 8;

    doc.font('Helvetica-Bold').fillColor('#334155').text('Charge Sheet No: ', 50, lineY, { continued: true });
    doc.font('Helvetica').fillColor('#0f172a').text(`${cs.chargeSheetNo || '—'}   `, { continued: true });
    doc.font('Helvetica-Bold').fillColor('#334155').text('Filing Date: ', { continued: true });
    doc.font('Helvetica').fillColor('#0f172a').text(cs.filingDate || '—');

    lineY += 18;
    doc.font('Helvetica-Bold').fillColor('#334155').text('Court Name: ', 50, lineY, { continued: true });
    doc.font('Helvetica').fillColor('#0f172a').text(`${cs.courtName || '—'}   `, { continued: true });
    doc.font('Helvetica-Bold').fillColor('#334155').text('CC / ST No: ', { continued: true });
    doc.font('Helvetica').fillColor('#0f172a').text(cs.ccStNo || '—');

    lineY += 18;
    doc.font('Helvetica-Bold').fillColor('#334155').text('Next Hearing: ', 50, lineY, { continued: true });
    doc.font('Helvetica').fillColor('#0f172a').text(`${cs.nextHearingDate || '—'}   `, { continued: true });
    doc.font('Helvetica-Bold').fillColor('#334155').text('Disposition: ', { continued: true });
    doc.font('Helvetica').fillColor('#0f172a').text(cs.dispositionSentence || '—');

    doc.y = csY + 80;
  }

  // ── Footer & Confidentiality Note ────────────────────────────────────────
  doc.moveDown(1);
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#94a3b8')
     .text(`Generated by: ${data.generatedBy} | Date: ${data.generatedAt}`, 40, doc.y, { align: 'right' });
  doc.fontSize(7.5).font('Helvetica').fillColor('#cbd5e1')
     .text('GARUDA Law Enforcement Intelligence Portal — Official Record (Confidential)', 40, doc.y + 12, { align: 'right' });

  // Stamp watermark on page
  applyWatermark(doc, watermarkText);

  return doc;
}
