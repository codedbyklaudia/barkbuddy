import type { Country, Continent, ContentCard, CountryContent } from './types';

export interface ChecklistPayload {
  country: Country;
  continent: Continent | null;
  content: Omit<CountryContent, 'countryId'>;
}

// Brand colours (hex, for jsPDF)
const COLORS = {
  twilightPurple:  [46,  14,  74]  as [number, number, number],
  serenePurple:    [130, 90, 190]  as [number, number, number],
  mistyLavender:   [196, 181, 220] as [number, number, number],
  softPearl:       [248, 246, 252] as [number, number, number],
  gentleAmethyst:  [150, 130, 180] as [number, number, number],
  white:           [255, 255, 255] as [number, number, number],
};

// Page dimensions (A4 portrait in mm)
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN  = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;

export async function generateTravelChecklist(payload: ChecklistPayload): Promise<void> {
  // Dynamic import — keeps bundle light when not used
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  let y = 0; 

  // Helper functions 

  const setColor = (rgb: [number, number, number]) => doc.setTextColor(...rgb);
  const setFill  = (rgb: [number, number, number]) => doc.setFillColor(...rgb);
  const setDraw  = (rgb: [number, number, number]) => doc.setDrawColor(...rgb);

  // Draw text and return new Y after it
  function text(
    content: string,
    x: number,
    yPos: number,
    opts?: { size?: number; bold?: boolean; italic?: boolean; color?: [number, number, number]; align?: 'left' | 'center' | 'right'; maxWidth?: number }
  ): number {
    const { size = 10, bold = false, italic = false, color = COLORS.twilightPurple, align = 'left', maxWidth } = opts ?? {};
    doc.setFontSize(size);
    doc.setFont('helvetica', bold && italic ? 'bolditalic' : bold ? 'bold' : italic ? 'italic' : 'normal');
    setColor(color);

    const lines = maxWidth
      ? doc.splitTextToSize(content, maxWidth)
      : [content];

    doc.text(lines, x, yPos, { align });
    const lineHeight = size * 0.4; // approx mm per pt
    return yPos + lines.length * lineHeight + 1;
  }

  // Wrapped body text — returns new Y
  function bodyText(content: string, yPos: number, color: [number, number, number] = COLORS.twilightPurple): number {
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    setColor(color);
    const lines = doc.splitTextToSize(content, CONTENT_W);
    doc.text(lines, MARGIN, yPos);
    return yPos + lines.length * 4.2 + 2;
  }

  // Horizontal rule
  function rule(yPos: number, color: [number, number, number] = COLORS.mistyLavender): number {
    setDraw(color);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, yPos, PAGE_W - MARGIN, yPos);
    return yPos + 5;
  }

  // Section heading pill
  function sectionHeading(label: string, yPos: number): number {
    setFill(COLORS.twilightPurple);
    doc.roundedRect(MARGIN, yPos, CONTENT_W, 10, 3, 3, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.softPearl);
    doc.text(label, PAGE_W / 2, yPos + 7, { align: 'center' });
    return yPos + 15;
  }

  // Card block for each content item
  function contentCard(card: ContentCard, yPos: number): number {
    const bodyLines = doc.splitTextToSize(card.body, CONTENT_W - 10);
    const cardHeight = 7 + bodyLines.length * 4.2 + 6; // title + body + padding

    // Guard: new page if needed
    if (yPos + cardHeight > PAGE_H - MARGIN) {
      doc.addPage();
      addPageFooter();
      yPos = MARGIN + 10;
    }

    setFill([232, 225, 245]); // soft lavender tint
    doc.roundedRect(MARGIN, yPos, CONTENT_W, cardHeight, 4, 4, 'F');

    // Card title
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.twilightPurple);
    doc.text(card.title, MARGIN + 5, yPos + 6);

    // Card body
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    setColor([80, 60, 110]);
    doc.text(bodyLines, MARGIN + 5, yPos + 12);

    return yPos + cardHeight + 5;
  }

  // Footer on every page
  function addPageFooter() {
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.gentleAmethyst);
    doc.text(`BarkBuddy Travel Checklist — ${payload.country.name}`, MARGIN, PAGE_H - 8);
    doc.text(`Page ${pageCount}`, PAGE_W - MARGIN, PAGE_H - 8, { align: 'right' });
  }

  // Page 1: Cover
  setFill(COLORS.twilightPurple);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

  // Decorative arc (top right)
  setFill(COLORS.serenePurple);
  doc.ellipse(PAGE_W + 10, -10, 60, 60, 'F');

  // BarkBuddy wordmark
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  setColor(COLORS.softPearl);
  doc.text('BarkBuddy', PAGE_W / 2, 55, { align: 'center' });

  // Tagline
  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  setColor(COLORS.mistyLavender);
  doc.text('Travel Checklist for Dog Owners', PAGE_W / 2, 64, { align: 'center' });

  // Divider
  setDraw(COLORS.serenePurple);
  doc.setLineWidth(0.8);
  doc.line(MARGIN * 2, 70, PAGE_W - MARGIN * 2, 70);

  // Destination
  doc.setFontSize(22);
  doc.setFont('helvetica', 'normal');
  setColor(COLORS.softPearl);
  doc.text('Travelling to', PAGE_W / 2, 95, { align: 'center' });

  doc.setFontSize(34);
  doc.setFont('helvetica', 'bold');
  setColor([200, 170, 255]);
  doc.text(payload.country.name, PAGE_W / 2, 112, { align: 'center' });

  if (payload.continent) {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.gentleAmethyst);
    doc.text(payload.continent.name, PAGE_W / 2, 123, { align: 'center' });
  }

  // Intro text
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  setColor(COLORS.mistyLavender);
  const introLines = doc.splitTextToSize(payload.content.intro, CONTENT_W - 20);
  doc.text(introLines, PAGE_W / 2, 145, { align: 'center' });

  // Sections overview
  const sections = ['Requirements', 'Documentation', 'Useful Tips'];
  let boxY = 175;
  sections.forEach(s => {
    setFill([60, 30, 90]);
    doc.roundedRect(MARGIN + 20, boxY, CONTENT_W - 40, 12, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(COLORS.softPearl);
    doc.text(s, PAGE_W / 2, boxY + 8.5, { align: 'center' });
    boxY += 17;
  });

  // Footer on cover
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  setColor(COLORS.gentleAmethyst);
  doc.text('Generated by BarkBuddy.com — All information is advisory. Always verify with official sources.',
    PAGE_W / 2, PAGE_H - 12, { align: 'center' });
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    PAGE_W / 2, PAGE_H - 7, { align: 'center' });

  // Page 2: Requirements
  doc.addPage();
  y = MARGIN + 5;

  y = sectionHeading('Requirements', y);
  y = text(`What your dog needs before travelling to ${payload.country.name}`, PAGE_W / 2, y,
    { size: 10, italic: true, color: COLORS.gentleAmethyst, align: 'center' });
  y += 3;

  for (const card of payload.content.requirements) {
    y = contentCard(card, y);
  }

  addPageFooter();

  // Page 3: Documentation
  doc.addPage();
  y = MARGIN + 5;

  y = sectionHeading('Documentation', y);
  y = text(`Official documents you need to prepare`, PAGE_W / 2, y,
    { size: 10, italic: true, color: COLORS.gentleAmethyst, align: 'center' });
  y += 3;

  for (const card of payload.content.documentation) {
    y = contentCard(card, y);
  }

  addPageFooter();

  // Page 4: Useful Tips
  doc.addPage();
  y = MARGIN + 5;

  y = sectionHeading('Useful Tips', y);
  y = text(`Practical advice from owners who have made this journey`, PAGE_W / 2, y,
    { size: 10, italic: true, color: COLORS.gentleAmethyst, align: 'center' });
  y += 3;

  for (const card of payload.content.tips) {
    y = contentCard(card, y);
  }

  addPageFooter();

  // Page 5: Quick-reference checklist
  doc.addPage();
  y = MARGIN + 5;

  y = sectionHeading('Quick-Reference Checklist', y);
  y = text('Tick each item before you travel', PAGE_W / 2, y,
    { size: 10, italic: true, color: COLORS.gentleAmethyst, align: 'center' });
  y += 5;

  const allItems = [
    ...payload.content.requirements.map(c => c.title),
    ...payload.content.documentation.map(c => c.title),
    ...payload.content.tips.map(c => c.title),
  ];

  for (const item of allItems) {
    if (y > PAGE_H - MARGIN - 10) {
      doc.addPage();
      addPageFooter();
      y = MARGIN + 10;
    }
    // Checkbox
    setDraw(COLORS.serenePurple);
    setFill(COLORS.white);
    doc.setLineWidth(0.5);
    doc.roundedRect(MARGIN, y - 3.5, 5, 5, 1, 1, 'FD');
    // Label
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.twilightPurple);
    doc.text(item, MARGIN + 8, y);
    y += 9;
  }

  addPageFooter();

  // Save 
  const filename = `BarkBuddy_${payload.country.name.replace(/\s+/g, '_')}_Checklist.pdf`;
  doc.save(filename);
}