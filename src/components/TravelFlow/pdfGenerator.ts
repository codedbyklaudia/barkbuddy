import type { Country, Continent, ContentCard, CountryContent } from './types';

// ─── Local font imports (bundled by Vite) ─────────────────────────────────────
import marcellusTTF  from '../../fonts/Marcellus/Marcellus-Regular.ttf';
import fredokaTTF    from '../../fonts/Fredoka/Fredoka-font.ttf';

export interface ChecklistPayload {
  country: Country;
  continent: Continent | null;
  content: Omit<CountryContent, 'countryId'>;
}

// ─── Brand palette ────────────────────────────────────────────────────────────
const C = {
  twilight:  [46,  14,  74]  as [number, number, number],
  serene:    [130, 90,  190] as [number, number, number],
  misty:     [196, 181, 220] as [number, number, number],
  pearl:     [248, 246, 252] as [number, number, number],
  amethyst:  [150, 130, 180] as [number, number, number],
  white:     [255, 255, 255] as [number, number, number],
  req:       [155, 127, 232] as [number, number, number],
  doc:       [109, 181, 234] as [number, number, number],
  tips:      [212, 168,  75] as [number, number, number],
  reqBg:     [235, 228, 252] as [number, number, number],
  docBg:     [220, 238, 252] as [number, number, number],
  tipsBg:    [252, 243, 220] as [number, number, number],
  reqText:   [55,  25, 100]  as [number, number, number],
  docText:   [15,  55, 105]  as [number, number, number],
  tipsText:  [85,  50,   8]  as [number, number, number],
};

const PW = 210;
const PH = 297;
const M  = 18;
const CW = PW - M * 2;

// ─── Get natural image dimensions via browser Image API ──────────────────────
function getImageDimensions(src: string): Promise<{ w: number; h: number }> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload  = () => resolve({ w: img.naturalWidth,  h: img.naturalHeight });
    img.onerror = () => resolve({ w: 1, h: 1 }); // safe fallback
    img.src = src;
  });
}

// ─── Convert a Vite-imported asset URL → base64 ───────────────────────────────
async function assetToBase64(url: string): Promise<string | null> {
  try {
    const res   = await fetch(url);
    if (!res.ok) return null;
    const buf   = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let bin = '';
    const CHUNK = 8192;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
    }
    return btoa(bin);
  } catch {
    return null;
  }
}

// ─── Main generator ───────────────────────────────────────────────────────────
export async function generateTravelChecklist(payload: ChecklistPayload): Promise<void> {
  const { default: jsPDF } = await import('jspdf');

  const [marcellusB64, fredokaB64, logoB64, logoDims] = await Promise.all([
    assetToBase64(marcellusTTF),
    assetToBase64(fredokaTTF),
    assetToBase64('/images/logo.png'),
    getImageDimensions('/images/logo.png'),
  ]);

  // Preserve natural aspect ratio — never stretch the logo
  const logoAspect = logoDims.w / logoDims.h;
  const logoCoverH = 44;
  const logoCoverW = logoCoverH * logoAspect;
  const logoSmallH = 22;
  const logoSmallW = logoSmallH * logoAspect;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  let hasMarkellus = false;
  let hasFredoka   = false;

  if (marcellusB64) {
    try {
      doc.addFileToVFS('Marcellus-Regular.ttf', marcellusB64);
      doc.addFont('Marcellus-Regular.ttf', 'Marcellus', 'normal');
      hasMarkellus = true;
    } catch { /* fallback to helvetica */ }
  }
  if (fredokaB64) {
    try {
      doc.addFileToVFS('Fredoka-Regular.ttf', fredokaB64);
      doc.addFont('Fredoka-Regular.ttf', 'Fredoka', 'normal');
      hasFredoka = true;
    } catch { /* fallback to helvetica */ }
  }

  let y = 0;

  // ── Colour helpers ───────────────────────────────────────────────────────
  const fill = (...rgb: [number,number,number]) => doc.setFillColor(...rgb);
  const draw = (...rgb: [number,number,number]) => doc.setDrawColor(...rgb);
  const ink  = (...rgb: [number,number,number]) => doc.setTextColor(...rgb);

  /** $font-primary — Marcellus */
  const H = (size: number) => {
    doc.setFontSize(size);
    doc.setFont(hasMarkellus ? 'Marcellus' : 'helvetica', 'normal');
  };
  /** $font-secondary — Fredoka */
  const B = (size: number) => {
    doc.setFontSize(size);
    doc.setFont(hasFredoka ? 'Fredoka' : 'helvetica', 'normal');
  };

  // ── Layout helpers ───────────────────────────────────────────────────────

  function dotGrid(x: number, y: number, cols: number, rows: number, gap: number, rgb: [number,number,number]) {
    fill(...rgb);
    for (let c = 0; c < cols; c++)
      for (let r = 0; r < rows; r++)
        doc.circle(x + c * gap, y + r * gap, 0.9, 'F');
  }

  /** Logo top-left on content pages */
  function logoTopLeft() {
    if (!logoB64) return;
    try { doc.addImage(logoB64, 'PNG', PW / 2 - logoSmallW / 2, 6, logoSmallW, logoSmallH); } catch { /* skip */ }
  }

  /** Logo centred + large on cover */
  function logoCover() {
    if (!logoB64) return;
    try { doc.addImage(logoB64, 'PNG', PW / 2 - logoCoverW / 2, 12, logoCoverW, logoCoverH); } catch { /* skip */ }
  }

  /** Footer bar */
  function footer() {
    fill(...C.serene);
    doc.rect(0, PH - 14, PW, 14, 'F');
    // Accent stripe
    fill(...C.tips);
    doc.rect(0, PH - 14, 5, 14, 'F');
    B(8); ink(...C.pearl);
    doc.text(`BarkBuddy · Travel Checklist · ${payload.country.name}`, M + 4, PH - 5.5);
    ink(...C.misty);
    doc.text(`Page ${doc.getNumberOfPages()}`, PW - M, PH - 5.5, { align: 'right' });
  }

  /** Section heading bar */
  function sectionBar(label: string, accent: [number,number,number], yPos: number): number {
    // Slightly lighter band so it stands out from the page bg
    fill(...C.twilight);
    doc.rect(0, yPos - 1, PW, 18, 'F');
    fill(...accent);
    doc.rect(0, yPos - 1, 6, 18, 'F');
    dotGrid(PW - 40, yPos + 2, 5, 2, 6, [100, 70, 150] as [number,number,number]);
    H(15); ink(...C.pearl);
    doc.text(label, M + 10, yPos + 11.5);
    return yPos + 24;
  }

  /** Subtitle under section bar */
  function sectionSub(text: string, yPos: number): number {
    B(11); ink(...C.amethyst);
    const lines = doc.splitTextToSize(text, CW);
    doc.text(lines, PW / 2, yPos, { align: 'center' });
    return yPos + lines.length * 6 + 5;
  }

  /** Content card — styled for twilight bg */
  function contentCard(
    card: ContentCard, yPos: number,
    accent: [number,number,number],
    bg: [number,number,number],
    textRgb: [number,number,number],
  ): number {
    B(11);
    const bodyLines = doc.splitTextToSize(card.body, CW - 16);
    const cardH = 13 + bodyLines.length * 5.5 + 9;

    if (yPos + cardH > PH - M - 16) {
      doc.addPage();
      contentPageBg();
      logoTopLeft();
      footer();
      yPos = M + 30;
    }

    // Card bg — semi-dark pill
    fill(...bg);
    doc.roundedRect(M, yPos, CW, cardH, 4, 4, 'F');

    // Left accent stripe
    fill(...accent);
    doc.roundedRect(M, yPos, 5, cardH, 2, 2, 'F');

    // Ghost large number
    H(36); 
    doc.setTextColor(accent[0], accent[1], accent[2]);
    doc.setGState(doc.GState({ opacity: 0.07 }));
    doc.text(String(doc.getNumberOfPages()), M + CW - 4, yPos + cardH - 4, { align: 'right' });
    doc.setGState(doc.GState({ opacity: 1 }));

    // Title — Marcellus
    H(13); ink(...textRgb);
    doc.text(card.title, M + 9, yPos + 10);

    // Body — Fredoka
    B(11); ink(
      Math.min(textRgb[0] + 30, 255),
      Math.min(textRgb[1] + 30, 255),
      Math.min(textRgb[2] + 30, 255),
    );
    doc.text(bodyLines, M + 9, yPos + 17);

    return yPos + cardH + 6;
  }

  /** Checklist row */
  function checkRow(label: string, yPos: number): number {
    if (yPos > PH - M - 16) {
      doc.addPage();
      contentPageBg();
      logoTopLeft();
      footer();
      yPos = M + 30;
    }
    // Checkbox
    draw(...C.serene); fill(...C.white);
    doc.setLineWidth(0.5);
    doc.roundedRect(M, yPos - 4, 5.5, 5.5, 1.2, 1.2, 'FD');
    // Label
    B(11); ink(...C.twilight);
    doc.text(label, M + 9, yPos);
    // Separator
    draw(...C.misty); doc.setLineWidth(0.2);
    doc.line(M + 9, yPos + 2.5, M + CW, yPos + 2.5);
    return yPos + 10;
  }

  /** Soft pearl background for all content pages */
  function contentPageBg() {
    fill(...C.pearl);
    doc.rect(0, 0, PW, PH, 'F');
    // Twilight top strip
    fill(...C.twilight);
    doc.rect(0, 0, PW, 4, 'F');
  }

  // ════════════════════════════════════════════════════════════════════════
  // COVER PAGE
  // ════════════════════════════════════════════════════════════════════════

  fill(...C.twilight); doc.rect(0, 0, PW, PH, 'F');

  // Decorative arcs
  fill(...C.serene);  doc.ellipse(PW + 18, -18, 75, 75, 'F');
  fill(70, 35, 105);  doc.ellipse(PW + 8,  -8,  55, 55, 'F');
  fill(38, 18,  60);  doc.ellipse(-18, PH + 18, 70, 70, 'F');
  fill(55, 22,  88);  doc.ellipse(-8,  PH + 8,  45, 45, 'F');

  dotGrid(M,         18, 7, 5, 9,  C.serene);
  dotGrid(PW-M-48, PH-62, 6, 5, 9, C.amethyst);

  // Double decorative rule
  draw(...C.serene); doc.setLineWidth(0.3);
  doc.line(M, 88, PW - M, 88);
  doc.line(M, 90, PW - M, 90);

  // Logo — large, centred
  logoCover();

  // BarkBuddy — Marcellus
  H(36); ink(...C.pearl);
  doc.text('BarkBuddy', PW / 2, 66, { align: 'center' });

  // Tagline — Fredoka
  B(13); ink(...C.misty);
  doc.text('Travel Checklist for Dog Owners', PW / 2, 76, { align: 'center' });

  // "TRAVELLING TO"
  B(10); ink(...C.amethyst);
  doc.text('TRAVELLING TO', PW / 2, 103, { align: 'center' });

  // Country — Marcellus XL
  H(42); ink(200, 170, 255);
  doc.text(payload.country.name, PW / 2, 122, { align: 'center' });

  if (payload.continent) {
    B(14); ink(...C.amethyst);
    doc.text(payload.continent.name, PW / 2, 133, { align: 'center' });
  }

  // Pill divider
  fill(...C.serene);
  doc.roundedRect(PW / 2 - 24, 139, 48, 2.5, 1.25, 1.25, 'F');

  // Intro
  B(11); ink(...C.misty);
  const introLines = doc.splitTextToSize(payload.content.intro, CW - 22);
  doc.text(introLines, PW / 2, 151, { align: 'center' });

  // Section overview cards
  const overviewSections: [string, [number,number,number]][] = [
    ['Requirements',  C.req],
    ['Documentation', C.doc],
    ['Useful Tips',   C.tips],
  ];
  let boxY = 190;
  overviewSections.forEach(([label, accent]) => {
    fill(55, 25, 88);
    doc.roundedRect(M + 14, boxY, CW - 28, 15, 3, 3, 'F');
    fill(...accent);
    doc.roundedRect(M + 14, boxY, 5, 15, 2, 2, 'F');
    H(12); ink(...C.pearl);
    doc.text(label, PW / 2, boxY + 10, { align: 'center' });
    boxY += 20;
  });

  // Cover footer
  B(8); ink(...C.amethyst);
  doc.text(
    'All information is advisory — always verify with official government sources.',
    PW / 2, PH - 14, { align: 'center' }
  );
  ink(100, 75, 140);
  doc.text(
    `Generated ${new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    PW / 2, PH - 8, { align: 'center' }
  );

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 2 — REQUIREMENTS
  // ════════════════════════════════════════════════════════════════════════

  doc.addPage();
  contentPageBg();
  logoTopLeft();
  footer();

  y = M + 32;
  y = sectionBar('Requirements', C.req, y);
  y = sectionSub(`Entry requirements for travelling to ${payload.country.name} with your dog.`, y);
  for (const card of payload.content.requirements) {
    y = contentCard(card, y, C.req, C.reqBg, C.reqText);
  }

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 3 — DOCUMENTATION
  // ════════════════════════════════════════════════════════════════════════

  doc.addPage();
  contentPageBg();
  logoTopLeft();
  footer();

  y = M + 32;
  y = sectionBar('Documentation', C.doc, y);
  y = sectionSub('Official documents you need to prepare before departure.', y);
  for (const card of payload.content.documentation) {
    y = contentCard(card, y, C.doc, C.docBg, C.docText);
  }

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 4 — USEFUL TIPS
  // ════════════════════════════════════════════════════════════════════════

  doc.addPage();
  contentPageBg();
  logoTopLeft();
  footer();

  y = M + 32;
  y = sectionBar('Useful Tips', C.tips, y);
  y = sectionSub('Practical advice from owners who have made this journey.', y);
  for (const card of payload.content.tips) {
    y = contentCard(card, y, C.tips, C.tipsBg, C.tipsText);
  }

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 5 — CHECKLIST
  // ════════════════════════════════════════════════════════════════════════

  doc.addPage();
  contentPageBg();
  logoTopLeft();
  footer();

  y = M + 30;
  y = sectionBar('Quick-Reference Checklist', C.serene, y);
  y = sectionSub("Tick each item off before you travel — don't miss a thing!", y);

  const groups: [string, ContentCard[], [number,number,number]][] = [
    ['Requirements',  payload.content.requirements, C.req],
    ['Documentation', payload.content.documentation, C.doc],
    ['Useful Tips',   payload.content.tips,          C.tips],
  ];

  for (const [groupLabel, cards, accent] of groups) {
    if (y > PH - M - 30) {
      doc.addPage();
      contentPageBg();
      logoTopLeft();
      footer();
      y = M + 30;
    }
    fill(...accent);
    doc.roundedRect(M, y - 4, 68, 9, 2, 2, 'F');
    B(9); ink(...C.white);
    doc.text(groupLabel.toUpperCase(), M + 5, y + 2);
    y += 13;
    for (const card of cards) y = checkRow(card.title, y);
    y += 6;
  }

  // Save 
  doc.save(`BarkBuddy_${payload.country.name.replace(/\s+/g, '_')}_Checklist.pdf`);
}