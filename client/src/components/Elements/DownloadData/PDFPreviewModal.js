import { Close, FileDownload } from '@mui/icons-material';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Dialog, Divider, IconButton, Typography } from '@mui/material';
import jsPDF from 'jspdf';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LogoImg from '../../../assets/img/logo-prod.png';

// ─── helpers ────────────────────────────────────────────────────────────────

const PDF_PURPLE      = [74, 20, 140];
const PDF_HEADER      = [255, 246, 246];
const PDF_PURPLE_LITE = [243, 229, 245];
const PDF_MARGIN      = 24;

// ─── Colour-legend constants ─────────────────────────────────────────────────

// Views where the map uses a continuous orange→dark-red gradient (not stepped)
const GRADIENT_MAP_VIEWS = [
  'Genotype prevalence', 'Serotype prevalence', 'Pathotype prevalence',
  'O prevalence', 'H prevalence', 'ST prevalence', 'NG-MAST prevalence',
  'Lineage prevalence (ST)',
];

// Heatmap graph IDs (BubbleHeatmapGraph2, BubbleMarkersHeatmapGraph, BubbleKOHeatmapGraph)
const HEATMAP_GRAPH_IDS = ['HSG2', 'BAMRH', 'BKOH'];

// Heatmap blue→red diverging gradient (matches mapColorHelper HEATMAP_STOPS)
const HEATMAP_COLOR_LEGEND = {
  type: 'gradient',
  title: '% Resistance',
  noDataColor: '#727272',
  noDataLabel: 'No data (0%)',
  stops: [
    [0, '#2166AC'], [0.2, '#5B97C9'], [0.4, '#92C5DE'],
    [0.6, '#C5826D'], [0.8, '#9E2B1F'], [1, '#6B0000'],
  ],
  startLabel: '0%',
  endLabel: '100%',
};

function hexToRgbArr(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? [parseInt(r[1], 16), parseInt(r[2], 16), parseInt(r[3], 16)] : [180, 180, 180];
}

function createGradientDataUrl(stops, w = 360, h = 40) {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, w, 0);
  stops.forEach(([pos, color]) => g.addColorStop(pos, color));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  return canvas.toDataURL('image/png');
}

// colorLegend: { type, title, noDataColor?, noDataLabel?, stops?, startLabel?, endLabel?, items? }
function drawColorLegendInPDF(doc, colorLegend, margin, _contentW, y) {
  const { type, title, noDataColor, noDataLabel, stops, startLabel, endLabel, items } = colorLegend;
  const FS = 6.5;
  const BOX = 8;
  doc.setFontSize(FS).setFont(undefined, 'normal');

  // Title label
  doc.setTextColor(90);
  const titleText = `${title}:`;
  doc.text(titleText, margin, y + FS - 0.5);
  let lx = margin + doc.getTextWidth(titleText) + 5;

  // "No data" swatch
  if (noDataColor) {
    doc.setFillColor(...hexToRgbArr(noDataColor));
    doc.setDrawColor(160); doc.setLineWidth(0.3);
    doc.rect(lx, y, BOX, BOX, 'FD');
    lx += BOX + 2;
    doc.setTextColor(70);
    doc.text(noDataLabel || 'No data', lx, y + FS - 0.5);
    lx += doc.getTextWidth(noDataLabel || 'No data') + 8;
  }

  if (type === 'gradient') {
    const BAR_W = 170;
    const BAR_H = BOX;

    if (startLabel) {
      doc.setTextColor(70);
      doc.text(startLabel, lx, y + FS - 0.5);
      lx += doc.getTextWidth(startLabel) + 3;
    }

    const gradDataUrl = createGradientDataUrl(stops, 360, 40);
    doc.addImage(gradDataUrl, 'PNG', lx, y, BAR_W, BAR_H, undefined, 'FAST');
    doc.setDrawColor(160); doc.setLineWidth(0.3);
    doc.rect(lx, y, BAR_W, BAR_H);
    lx += BAR_W + 3;

    if (endLabel) {
      doc.setTextColor(70);
      doc.text(endLabel, lx, y + FS - 0.5);
    }

  } else if (type === 'steps') {
    items.forEach(({ color, label }) => {
      doc.setFillColor(...hexToRgbArr(color));
      doc.setDrawColor(160); doc.setLineWidth(0.3);
      doc.rect(lx, y, BOX, BOX, 'FD');
      lx += BOX + 2;
      doc.setTextColor(70);
      doc.text(label, lx, y + FS - 0.5);
      lx += doc.getTextWidth(label) + 8;
    });
  }

  doc.setTextColor(0).setDrawColor(0).setLineWidth(0.2);
}

function getMapColorLegend(mapViewValue) {
  if (!mapViewValue || mapViewValue === 'Dominant Genotype') return null;

  if (mapViewValue === 'No. Samples') {
    return {
      type: 'steps',
      title: 'No. Samples',
      noDataColor: '#D3D3D3', noDataLabel: 'Insufficient data',
      items: [
        { color: '#4575B4', label: '1-9' },
        { color: '#91BFDB', label: '10-19' },
        { color: '#ADDD8E', label: '20-99' },
        { color: '#FEE090', label: '100-299' },
        { color: '#FC8D59', label: '>=300' },
      ],
    };
  }

  if (GRADIENT_MAP_VIEWS.includes(mapViewValue)) {
    return {
      type: 'gradient',
      title: 'Prevalence',
      noDataColor: '#D3D3D3', noDataLabel: 'No data (N<20)',
      stops: [[0, '#FAAD8F'], [0.33, '#FA694A'], [0.67, '#DD2C24'], [1, '#A20F17']],
      startLabel: '1%', endLabel: '100%',
    };
  }

  // Resistance prevalence and all other percentage-based map views
  return {
    type: 'steps',
    title: '% Resistance',
    noDataColor: '#D3D3D3', noDataLabel: 'No data (N<20)',
    items: [
      { color: '#FAAD8F', label: '>0-2%' },
      { color: '#FA694A', label: '>2-10%' },
      { color: '#DD2C24', label: '>10-50%' },
      { color: '#A20F17', label: '>50%' },
    ],
  };
}

function drawPDFHeader(doc, logo, pageWidth) {
  doc.setFillColor(...PDF_HEADER);
  doc.rect(0, 0, pageWidth, 32, 'F');
  doc.addImage(logo, 'PNG', PDF_MARGIN, 4, 44, 23, undefined, 'FAST');
  doc.setFontSize(8).setFont(undefined, 'normal').setTextColor(220, 200, 240);
  doc.text('amrnet.org', pageWidth - PDF_MARGIN, 20, { align: 'right' });
  doc.setTextColor(0);
}

function drawPDFFooter(doc, pageNum, pageWidth, pageHeight) {
  doc.setDrawColor(...PDF_PURPLE);
  doc.line(0, pageHeight - 22, pageWidth, pageHeight - 22);
  doc.setFontSize(7).setFont(undefined, 'normal').setTextColor(100);
  doc.text(
    'AMRnet · amrnet.org · Cerdeira et al., Nucleic Acids Res, 2026 · doi: 10.1093/nar/gkaf1101',
    PDF_MARGIN, pageHeight - 10,
  );
  doc.text(String(pageNum), pageWidth - PDF_MARGIN, pageHeight - 10, { align: 'right' });
  doc.setTextColor(0).setDrawColor(0);
}

function addImagePage({ doc, logo, title, subtitle, imageDataUrl, imgW, imgH, pageWidth, pageHeight, pageNumRef, colorLegend }) {
  doc.addPage();
  drawPDFHeader(doc, logo, pageWidth);
  drawPDFFooter(doc, pageNumRef.current++, pageWidth, pageHeight);
  const margin   = PDF_MARGIN;
  const contentW = pageWidth - 2 * margin;
  let y = 44;
  doc.setFontSize(13).setFont(undefined, 'bold').setTextColor(...PDF_PURPLE);
  doc.text(title, margin, y);
  y += 14;
  if (subtitle) {
    doc.setFontSize(9).setFont(undefined, 'normal').setTextColor(100);
    const lines = doc.splitTextToSize(subtitle, contentW);
    doc.text(lines, margin, y);
    y += lines.length * 10 + 8;
    doc.setTextColor(0);
  }
  const LEGEND_H = colorLegend ? 24 : 0;
  const availH = pageHeight - y - 32 - LEGEND_H;
  const ratio  = imgW && imgH ? imgW / imgH : 16 / 9;
  let w = contentW, h = w / ratio;
  if (h > availH) { h = availH; w = h * ratio; }
  const imgX = margin + (contentW - w) / 2;
  if (imageDataUrl) {
    doc.setFillColor(...PDF_PURPLE_LITE);
    doc.roundedRect(imgX - 4, y - 4, w + 8, h + 8, 3, 3, 'F');
    doc.addImage(imageDataUrl, 'PNG', imgX, y, w, h, undefined, 'FAST');
  }
  if (colorLegend) {
    drawColorLegendInPDF(doc, colorLegend, margin, contentW, y + h + 10);
  }
}

// ── Structured text blocks → PDF ─────────────────────────────────────────────
function renderTextBlocksPDF(doc, blocks, margin, contentW, yStart, pageHeight, pageNumRef, logo, pageWidth) {
  let y = yStart;
  const checkPage = () => {
    if (y > pageHeight - 36) {
      doc.addPage();
      drawPDFHeader(doc, logo, pageWidth);
      drawPDFFooter(doc, pageNumRef.current++, pageWidth, pageHeight);
      y = 46;
    }
  };

  for (const block of blocks) {
    if (!block?.text) continue;
    checkPage();
    const { type, text } = block;

    if (type === 'heading') {
      y += 4;
      doc.setFontSize(11).setFont(undefined, 'bold').setTextColor(...PDF_PURPLE);
      doc.text(text, margin, y);
      y += 3;
      doc.setDrawColor(...PDF_PURPLE);
      doc.setLineWidth(0.4);
      doc.line(margin, y, margin + contentW, y);
      doc.setLineWidth(0.2).setDrawColor(0);
      y += 9;
    } else if (type === 'subheading') {
      doc.setFontSize(9).setFont(undefined, 'bold').setTextColor(50, 50, 50);
      const lines = doc.splitTextToSize(text, contentW - 4);
      doc.text(lines, margin, y);
      y += lines.length * 10 + 4;
    } else if (type === 'warning') {
      doc.setFontSize(8.5).setFont(undefined, 'bold');
      const lines = doc.splitTextToSize(`WARNING: ${text}`, contentW - 14);
      const bh    = lines.length * 10 + 10;
      doc.setFillColor(255, 253, 175);
      doc.roundedRect(margin, y - 3, contentW, bh, 2, 2, 'F');
      doc.setFillColor(230, 168, 23);
      doc.rect(margin, y - 3, 3, bh, 'F');
      doc.setTextColor(90, 60, 0);
      doc.text(lines, margin + 9, y + 6);
      doc.setTextColor(0);
      y += bh + 6;
    } else if (type === 'bullet') {
      doc.setFontSize(8.5).setFont(undefined, 'normal').setTextColor(20, 20, 20);
      const lines = doc.splitTextToSize(text, contentW - 16);
      doc.text('•', margin + 4, y);
      doc.text(lines, margin + 12, y);
      y += lines.length * 10 + 2;
    } else {
      // body
      doc.setFontSize(8.5).setFont(undefined, 'normal').setTextColor(20, 20, 20);
      const lines = doc.splitTextToSize(text, contentW - 4);
      doc.text(lines, margin + 2, y);
      y += lines.length * 10 + 4;
    }
  }
  return y;
}

async function generatePDF(data, setLoading) {
  setLoading(true);
  try {
    const { firstName, secondName, texts, metadata, mapImage, bgCapture, bhpCapture, graphs, organism, insightsCaptures, radarCapture } = data;

    const doc        = new jsPDF({ unit: 'px', format: 'a4' });
    const pageWidth  = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin     = 16;
    const contentW   = pageWidth - 2 * margin;
    const pageNumRef = { current: 1 };

    const logo = new Image();
    logo.src = LogoImg;
    await new Promise(r => { logo.onload = r; logo.onerror = r; });

    // ── Page 1: Cover ─────────────────────────────────────────────────────
    drawPDFHeader(doc, logo, pageWidth);
    drawPDFFooter(doc, pageNumRef.current++, pageWidth, pageHeight);

    let y = 48;
    doc.setFontSize(9).setFont(undefined, 'normal').setTextColor(120);
    doc.text('AMRnet Report', pageWidth / 2, y, { align: 'center' });
    y += 18;
    doc.setFontSize(18).setFont(undefined, 'bold').setTextColor(0);
    doc.text(firstName, pageWidth / 2, y, { align: 'center' });
    y += 14;
    doc.setFontSize(14).setFont(undefined, 'italic');
    doc.text(secondName, pageWidth / 2, y, { align: 'center' });
    y += 14;
    doc.setFontSize(9).setFont(undefined, 'normal').setTextColor(120);
    doc.text(
      new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }),
      pageWidth / 2, y, { align: 'center' },
    );
    y += 16;
    doc.setDrawColor(220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Metadata grid
    const metaItems = [
      ['Country',       metadata.country],
      ['Time Period',   `${metadata.timeInitial} – ${metadata.timeFinal}`],
      ['Total Genomes', String(metadata.genomes ?? '')],
      ['Dataset',       metadata.dataset],
      // ['Map View',      metadata.mapView],
      // ['Organism',      metadata.organism],
    ].filter(([, v]) => v);

    const cellW = contentW / 2, cellH = 22;
    doc.setFontSize(8);
    metaItems.forEach(([label, value], i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const cx = margin + col * cellW, cy = y + row * cellH;
      doc.setFillColor(248, 249, 250);
      doc.rect(cx, cy, cellW - 3, cellH - 1, 'F');
      doc.setFont(undefined, 'normal').setTextColor(130);
      doc.text(label, cx + 5, cy + 9);
      doc.setFont(undefined, 'bold').setTextColor(0);
      doc.text(doc.splitTextToSize(value, cellW - 10)[0], cx + 5, cy + 18);
    });
    y += Math.ceil(metaItems.length / 2) * cellH + 14;
    doc.setDrawColor(220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Structured info text
    if (texts && texts.length > 0) {
      y = renderTextBlocksPDF(doc, texts, margin, contentW, y, pageHeight, pageNumRef, logo, pageWidth);
    }

    // ── Image pages ────────────────────────────────────────────────────────
    if (mapImage) {
      addImagePage({ doc, logo, title: `Global Overview — ${metadata.mapView}`, subtitle: metadata.organism, imageDataUrl: mapImage, imgW: 1200, imgH: 600, pageWidth, pageHeight, pageNumRef, colorLegend: getMapColorLegend(metadata.mapViewValue) });
    }
    if (bgCapture?.dataUrl) {
      addImagePage({ doc, logo, title: 'Geographic Comparisons', subtitle: metadata.mapView, imageDataUrl: bgCapture.dataUrl, imgW: bgCapture.width, imgH: bgCapture.height, pageWidth, pageHeight, pageNumRef, colorLegend: HEATMAP_COLOR_LEGEND });
    }
    if (bhpCapture?.dataUrl) {
      addImagePage({ doc, logo, title: organism === 'sentericaints' ? 'Serotype Comparisons' : 'Pathotype Comparisons', subtitle: metadata.mapView, imageDataUrl: bhpCapture.dataUrl, imgW: bhpCapture.width, imgH: bhpCapture.height, pageWidth, pageHeight, pageNumRef, colorLegend: HEATMAP_COLOR_LEGEND });
    }
    for (const graph of graphs) {
      if (!graph.image) continue;
      addImagePage({ doc, logo, title: graph.title, subtitle: [
        graph.description?.filter(Boolean).join(' / ').replaceAll('≥', '>='),
        graph.subtitle,
        graph.drugInfo,
      ].filter(Boolean).join('\n'), imageDataUrl: graph.image, imgW: graph.width, imgH: graph.height, pageWidth, pageHeight, pageNumRef, colorLegend: HEATMAP_GRAPH_IDS.includes(graph.id) ? HEATMAP_COLOR_LEGEND : null });
    }

    for (const insight of (insightsCaptures ?? [])) {
      if (!insight.dataUrl) continue;
      addImagePage({ doc, logo, title: insight.label, subtitle: 'AMR Insights', imageDataUrl: insight.dataUrl, imgW: insight.width, imgH: insight.height, pageWidth, pageHeight, pageNumRef });
    }

    if (radarCapture?.dataUrl) {
      addImagePage({ doc, logo, title: 'AMR Radar Profile', subtitle: 'Drug resistance profiles by country / region', imageDataUrl: radarCapture.dataUrl, imgW: radarCapture.width, imgH: radarCapture.height, pageWidth, pageHeight, pageNumRef });
    }

    doc.save(`AMRnet - ${firstName} ${secondName} Report.pdf`);
  } finally {
    setLoading(false);
  }
}

// ─── Preview: colour-legend strip ────────────────────────────────────────────
function ColorLegendPreview({ colorLegend }) {
  if (!colorLegend) return null;
  const { type, title, noDataColor, noDataLabel, stops, startLabel, endLabel, items } = colorLegend;

  const swatchStyle = color => ({
    width: 12, height: 12, background: color,
    border: '1px solid rgba(0,0,0,0.15)', borderRadius: 2, flexShrink: 0,
  });

  const gradientCss = stops
    ? `linear-gradient(to right, ${stops.map(([p, c]) => `${c} ${(p * 100).toFixed(0)}%`).join(', ')})`
    : '';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, px: 2, pt: 1, pb: 1.5, borderTop: '1px solid #f0f0f0' }}>
      <Box component="span" sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 600, mr: 0.5 }}>
        {title}:
      </Box>
      {noDataColor && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={swatchStyle(noDataColor)} />
          <Box component="span" sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>{noDataLabel || 'No data'}</Box>
        </Box>
      )}
      {type === 'gradient' && stops && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {startLabel && <Box component="span" sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>{startLabel}</Box>}
          <Box sx={{ width: 120, height: 12, background: gradientCss, border: '1px solid rgba(0,0,0,0.12)', borderRadius: 1 }} />
          {endLabel && <Box component="span" sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>{endLabel}</Box>}
        </Box>
      )}
      {type === 'steps' && items && items.map(({ color, label }, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={swatchStyle(color)} />
          <Box component="span" sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>{label}</Box>
        </Box>
      ))}
    </Box>
  );
}

// ─── Preview: single block ────────────────────────────────────────────────────
function PreviewBlock({ block }) {
  if (!block?.text) return null;
  const { type, text } = block;

  if (type === 'heading') return (
    <Box sx={{ mt: 2, mb: 0.5 }}>
      <Typography sx={{ fontWeight: 800, color: '#4a148c', letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.72rem' }}>
        {text}
      </Typography>
      <Box sx={{ height: '2px', bgcolor: '#4a148c', borderRadius: 1, mt: 0.3, opacity: 0.2 }} />
    </Box>
  );

  if (type === 'subheading') return (
    <Typography sx={{ fontWeight: 700, color: '#333', mt: 1, fontSize: '0.8rem' }}>{text}</Typography>
  );

  if (type === 'warning') return (
    <Box sx={{ bgcolor: '#fff9c4', borderLeft: '4px solid #f9a825', px: 1.5, py: 0.85, borderRadius: '0 4px 4px 0', my: 0.75 }}>
      <Typography sx={{ fontWeight: 700, color: '#5d4037', fontSize: '0.8rem' }}>⚠ WARNING: {text}</Typography>
    </Box>
  );

  if (type === 'bullet') return (
    <Box sx={{ display: 'flex', gap: 1, pl: 1 }}>
      <Typography sx={{ color: '#4a148c', fontWeight: 700, flexShrink: 0, fontSize: '0.8rem' }}>•</Typography>
      <Typography sx={{ color: '#333', fontSize: '0.8rem', lineHeight: 1.6 }}>{text}</Typography>
    </Box>
  );

  // body
  return <Typography sx={{ color: '#444', fontSize: '0.8rem', lineHeight: 1.65 }}>{text}</Typography>;
}

// ─── Preview card wrapper ─────────────────────────────────────────────────────
function ReportCard({ title, subtitle, subtitle2, children, accent }) {
  return (
    <Box sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
      {(title || accent) && (
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {accent && <Box sx={{ width: 4, height: 24, bgcolor: accent, borderRadius: 1 }} />}
          <Box>
            {title    && <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>{title}</Typography>}
            {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
            {subtitle2 && <Typography variant="caption" color="text.secondary" display="block">{subtitle2}</Typography>}  {/* ← add this */}
          </Box>
        </Box>
      )}
      <Box sx={{ p: title ? 2 : 0 }}>{children}</Box>
    </Box>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────
export function PDFPreviewModal({ open, onClose, data }) {
  const { t } = useTranslation();
  const [pdfLoading, setPdfLoading] = useState(false);
  if (!data) return null;

  const { firstName, secondName, texts, metadata, mapImage, bgCapture, bhpCapture, graphs, organism, insightsCaptures, radarCapture } = data;
  const accentColor = '#1565c0';

  const metaChips = [
    { label: 'Country',     value: metadata.country },
    { label: 'Time Period', value: `${metadata.timeInitial} – ${metadata.timeFinal}` },
    { label: 'Genomes',     value: Number(metadata.genomes ?? 0).toLocaleString() },
    { label: 'Dataset',     value: metadata.dataset },
    { label: 'Map View',    value: metadata.mapView },
  ].filter(x => x.value && x.value !== 'undefined');

  return (
    <Dialog fullScreen open={open} onClose={onClose} PaperProps={{ sx: { bgcolor: '#eef0f4' } }}>
      {/* Toolbar */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 200, bgcolor: '#fff', display: 'flex', alignItems: 'center', px: 2, py: 1, gap: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <Box component="img" src={LogoImg} alt="AMRnet" sx={{ height: 34 }} />
        <Typography variant="h6" fontWeight={700} sx={{ flex: 1, fontSize: 16 }}>
          Report Preview — <em>{firstName} {secondName}</em>
        </Typography>
        <LoadingButton variant="contained" loading={pdfLoading} startIcon={<FileDownload />}
          onClick={() => generatePDF(data, setPdfLoading)}
          sx={{ bgcolor: '#e2acf6', '&:hover': { bgcolor: '#cc6fee' }, textTransform: 'none', fontWeight: 700 }}
        >
          Download PDF
        </LoadingButton>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 960, mx: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* Cover */}
        <ReportCard>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 2 }}>AMRnet Report</Typography>
              <Typography variant="h4" fontWeight={800} lineHeight={1.1} sx={{ mt: 0.5 }}>{firstName}</Typography>
              <Typography variant="h5" fontStyle="italic" color="text.secondary" lineHeight={1.2}>{secondName}</Typography>
              <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                Generated {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </Box>
            <Box component="img" src={LogoImg} alt="AMRnet" sx={{ height: 48, opacity: 0.7 }} />
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {metaChips.map(({ label, value }) => (
              <Box key={label} sx={{ px: 2, py: 1, bgcolor: '#f5f7fa', borderRadius: 1.5, minWidth: 130 }}>
                <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
                <Typography variant="body2" fontWeight={700}>{value}</Typography>
              </Box>
            ))}
          </Box>
        </ReportCard>

        {/* Info blocks */}
        {texts && texts.filter(b => b?.text).length > 0 && (
          <ReportCard title={t('pdf.reportInformation')} accent={accentColor}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {texts.map((block, i) => <PreviewBlock key={i} block={block} />)}
            </Box>
          </ReportCard>
        )}

        {/* Map */}
        {mapImage && (
          <ReportCard title={`Global Overview — ${metadata.mapView}`} subtitle={metadata.organism} accent={accentColor}>
            <Box component="img" src={mapImage} alt="Global Map" sx={{ width: '100%', borderRadius: 1, display: 'block' }} />
            <ColorLegendPreview colorLegend={getMapColorLegend(metadata.mapViewValue)} />
          </ReportCard>
        )}

        {/* Geographic Comparisons */}
        {bgCapture?.dataUrl && (
          <ReportCard title={t('pdf.geographicComparisons')} subtitle={metadata.mapView} accent={accentColor}>
            <Box
              component="img"
              src={bgCapture.dataUrl}
              alt="Geographic Comparisons"
              sx={{ width: '100%', borderRadius: 1, display: 'block' }}
            />
            <ColorLegendPreview colorLegend={HEATMAP_COLOR_LEGEND} />
          </ReportCard>
        )}

        {/* Pathotype / Serotype */}
        {bhpCapture?.dataUrl && (
          <ReportCard title={organism === 'sentericaints' ? 'Serotype Comparisons' : 'Pathotype Comparisons'} subtitle={metadata.mapView} accent={accentColor}>
            <Box component="img" src={bhpCapture.dataUrl} alt="Comparisons" sx={{ width: '100%', borderRadius: 1, display: 'block' }} />
            <ColorLegendPreview colorLegend={HEATMAP_COLOR_LEGEND} />
          </ReportCard>
        )}

        {/* Graphs */}
        {graphs.filter(g => g.image).map((g, i) => (
          <ReportCard key={i} title={g.title} subtitle={g.description?.filter(Boolean).join(' / ')} subtitle2={[g.subtitle, g.drugInfo].filter(Boolean).join(' | ')} accent={accentColor}>
            <Box component="img" src={g.image} alt={g.title} sx={{ width: '100%', borderRadius: 1, display: 'block' }} />
            {HEATMAP_GRAPH_IDS.includes(g.id) && <ColorLegendPreview colorLegend={HEATMAP_COLOR_LEGEND} />}
          </ReportCard>
        ))}

        {/* AMR Insights tabs */}
        {(insightsCaptures ?? []).filter(c => c.dataUrl).map((c, i) => (
          <ReportCard key={`insight-${i}`} title={c.label} subtitle="AMR Insights" accent={accentColor}>
            <Box component="img" src={c.dataUrl} alt={c.label} sx={{ width: '100%', borderRadius: 1, display: 'block' }} />
          </ReportCard>
        ))}

        {/* Radar Profile */}
        {radarCapture?.dataUrl && (
          <ReportCard title="AMR Radar Profile" subtitle="Drug resistance profiles by country / region" accent={accentColor}>
            <Box component="img" src={radarCapture.dataUrl} alt="AMR Radar Profile" sx={{ width: '100%', borderRadius: 1, display: 'block' }} />
          </ReportCard>
        )}

        {/* Citation */}
        <Box sx={{ textAlign: 'center', pb: 2 }}>
          <Typography variant="caption" color="text.disabled">
            AMRnet ·{' '}
            <a href="https://amrnet.org" target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>
              amrnet.org
            </a>
            ·{' '}
            <a
              href="https://doi.org/10.1093/nar/gkaf1101"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'inherit' }}
            >
              Cerdeira et al., Nucleic Acids Res, 2026
            </a>
          </Typography>
        </Box>
      </Box>
    </Dialog>
  );
}
