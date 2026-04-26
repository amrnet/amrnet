import { Close, FileDownload } from '@mui/icons-material';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Dialog, Divider, IconButton, Typography } from '@mui/material';
import jsPDF from 'jspdf';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LogoImg from '../../../assets/img/logo-prod.png';

// ─── helpers ────────────────────────────────────────────────────────────────

// Purple palette for PDF
const PDF_PURPLE = [74, 20, 140]; // #4a148c
const PDF_PURPLE_LITE = [243, 229, 245]; // #f3e5f5
const PDF_MARGIN = 24;

function drawPDFHeader(doc, logo, pageWidth) {
  // Purple top bar
  doc.setFillColor(...PDF_PURPLE);
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
    PDF_MARGIN,
    pageHeight - 10,
  );
  doc.text(String(pageNum), pageWidth - PDF_MARGIN, pageHeight - 10, { align: 'right' });
  doc.setTextColor(0).setDrawColor(0);
}

function addImagePage({ doc, logo, title, subtitle, imageDataUrl, imgW, imgH, pageWidth, pageHeight, pageNumRef }) {
  doc.addPage();
  drawPDFHeader(doc, logo, pageWidth);
  drawPDFFooter(doc, pageNumRef.current++, pageWidth, pageHeight);
  const margin = PDF_MARGIN;
  const contentW = pageWidth - 2 * margin;
  let y = 44;
  doc
    .setFontSize(13)
    .setFont(undefined, 'bold')
    .setTextColor(...PDF_PURPLE);
  doc.text(title, margin, y);
  y += 14;
  if (subtitle) {
    doc.setFontSize(9).setFont(undefined, 'normal').setTextColor(100);
    const lines = doc.splitTextToSize(subtitle, contentW);
    doc.text(lines, margin, y);
    y += lines.length * 10 + 8;
    doc.setTextColor(0);
  }
  // Light purple tint behind the image
  const availH = pageHeight - y - 32;
  const ratio = imgW && imgH ? imgW / imgH : 16 / 9;
  let w = contentW;
  let h = w / ratio;
  if (h > availH) {
    h = availH;
    w = h * ratio;
  }
  const imgX = margin + (contentW - w) / 2;
  if (imageDataUrl) {
    doc.setFillColor(...PDF_PURPLE_LITE);
    doc.roundedRect(imgX - 4, y - 4, w + 8, h + 8, 3, 3, 'F');
    doc.addImage(imageDataUrl, 'PNG', imgX, y, w, h, undefined, 'FAST');
  }
}

async function generatePDF(data, setLoading) {
  setLoading(true);
  try {
    const { firstName, secondName, texts, metadata, mapImage, bgCapture, bhpCapture, graphs, organism } = data;

    const doc = new jsPDF({ unit: 'px', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 16;
    const contentW = pageWidth - 2 * margin;
    const pageNumRef = { current: 1 };

    const logo = new Image();
    logo.src = LogoImg;
    await new Promise(r => {
      logo.onload = r;
      logo.onerror = r;
    });

    // ── Page 1: Cover + metadata ──────────────────────────────────────────
    drawPDFHeader(doc, logo, pageWidth);
    drawPDFFooter(doc, pageNumRef.current++, pageWidth, pageHeight);

    let y = 48;
    doc.setFontSize(9).setFont(undefined, 'normal').setTextColor(120);
    doc.text('AMRnet Report', margin, y);
    y += 12;
    doc.setFontSize(18).setFont(undefined, 'bold').setTextColor(0);
    doc.text(firstName, margin, y);
    y += 18;
    doc.setFontSize(14).setFont(undefined, 'italic');
    doc.text(secondName, margin, y);
    y += 14;
    doc.setFontSize(9).setFont(undefined, 'normal').setTextColor(120);
    doc.text(new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }), margin, y);
    y += 16;
    doc.setDrawColor(220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Metadata grid (2 columns)
    const metaItems = [
      ['Country', metadata.country],
      ['Time Period', `${metadata.timeInitial} – ${metadata.timeFinal}`],
      ['Total Genomes', String(metadata.genomes ?? '')],
      ['Dataset', metadata.dataset],
      ['Map View', metadata.mapView],
      ['Organism', metadata.organism],
    ].filter(([, v]) => v);

    const cellW = contentW / 2;
    const cellH = 22;
    doc.setFontSize(8);
    metaItems.forEach(([label, value], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = margin + col * cellW;
      const cy = y + row * cellH;
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

    // Info text (auto-flowing)
    if (texts && texts.length > 0) {
      const warningIdx = texts.findIndex(t => t?.startsWith?.('WARNING'));
      doc.setFontSize(9);
      for (let i = 0; i < texts.length; i++) {
        const text = texts[i];
        if (!text) continue;
        if (y > pageHeight - 36) {
          doc.addPage();
          drawPDFHeader(doc, logo, pageWidth);
          drawPDFFooter(doc, pageNumRef.current++, pageWidth, pageHeight);
          y = 46;
        }
        const isWarning = i === warningIdx;
        const lines = doc.splitTextToSize(text, contentW - 4);
        if (isWarning) {
          doc.setFillColor(255, 253, 175);
          doc.rect(margin, y - 3, contentW, lines.length * 10 + 6, 'F');
          doc.setFont(undefined, 'bold').setTextColor(0);
        } else if (
          text.length < 40 &&
          (text.endsWith(':') || ['Variable definitions', 'Abbreviations', 'Source Data'].includes(text))
        ) {
          doc.setFont(undefined, 'bold').setTextColor(0);
        } else {
          doc.setFont(undefined, 'normal').setTextColor(20);
        }
        doc.text(lines, margin + 2, y + 7);
        y += lines.length * 10 + 3;
      }
    }

    // ── Map page ──────────────────────────────────────────────────────────
    if (mapImage) {
      addImagePage({
        doc,
        logo,
        title: `Global Overview — ${metadata.mapView}`,
        subtitle: metadata.organism,
        imageDataUrl: mapImage,
        imgW: 1200,
        imgH: 600,
        pageWidth,
        pageHeight,
        pageNumRef,
      });
    }

    // ── Geographic Comparisons ────────────────────────────────────────────
    if (bgCapture?.dataUrl) {
      addImagePage({
        doc,
        logo,
        title: 'Geographic Comparisons',
        subtitle: metadata.mapView,
        imageDataUrl: bgCapture.dataUrl,
        imgW: bgCapture.width,
        imgH: bgCapture.height,
        pageWidth,
        pageHeight,
        pageNumRef,
      });
    }

    // ── Pathotype / Serotype Comparisons ──────────────────────────────────
    if (bhpCapture?.dataUrl) {
      const bhpTitle = organism === 'sentericaints' ? 'Serotype Comparisons' : 'Pathotype Comparisons';
      addImagePage({
        doc,
        logo,
        title: bhpTitle,
        subtitle: metadata.mapView,
        imageDataUrl: bhpCapture.dataUrl,
        imgW: bhpCapture.width,
        imgH: bhpCapture.height,
        pageWidth,
        pageHeight,
        pageNumRef,
      });
    }

    // ── Graph pages ────────────────────────────────────────────────────────
    for (const graph of graphs) {
      if (!graph.image) continue;
      addImagePage({
        doc,
        logo,
        title: graph.title,
        subtitle: graph.description?.filter(Boolean).join(' / ').replaceAll('≥', '>='),
        imageDataUrl: graph.image,
        imgW: graph.width,
        imgH: graph.height,
        pageWidth,
        pageHeight,
        pageNumRef,
      });
    }

    doc.save(`AMRnet - ${firstName} ${secondName} Report.pdf`);
  } finally {
    setLoading(false);
  }
}

// ─── Preview card ─────────────────────────────────────────────────────────

function ReportCard({ title, subtitle, children, accent }) {
  return (
    <Box sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
      {(title || accent) && (
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {accent && <Box sx={{ width: 4, height: 24, bgcolor: accent, borderRadius: 1 }} />}
          <Box>
            {title && (
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      )}
      <Box sx={{ p: title ? 2 : 0 }}>{children}</Box>
    </Box>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────

export function PDFPreviewModal({ open, onClose, data }) {
  const { t } = useTranslation();
  const [pdfLoading, setPdfLoading] = useState(false);

  if (!data) return null;

  const { firstName, secondName, texts, metadata, mapImage, bgCapture, bhpCapture, graphs, organism } = data;

  const accentColor = '#1565c0';

  const metaChips = [
    { label: 'Country', value: metadata.country },
    { label: 'Time Period', value: `${metadata.timeInitial} – ${metadata.timeFinal}` },
    { label: 'Genomes', value: Number(metadata.genomes ?? 0).toLocaleString() },
    { label: 'Dataset', value: metadata.dataset },
    { label: 'Map View', value: metadata.mapView },
  ].filter(x => x.value && x.value !== 'undefined');

  return (
    <Dialog fullScreen open={open} onClose={onClose} PaperProps={{ sx: { bgcolor: '#eef0f4' } }}>
      {/* ── Sticky toolbar ── */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 200,
          bgcolor: 'rgb(255, 255, 255)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1,
          gap: 2,
          boxShadow: '0 2px 8px rgb(255, 255, 255)',
        }}
      >
        <Box component="img" src={LogoImg} alt="AMRnet" sx={{ height: 34 }} />
        <Typography variant="h6" fontWeight={700} sx={{ flex: 1, fontSize: 16 }}>
          Report Preview —{' '}
          <em>
            {firstName} {secondName}
          </em>
        </Typography>
        <LoadingButton
          variant="contained"
          loading={pdfLoading}
          startIcon={<FileDownload />}
          onClick={() => generatePDF(data, setPdfLoading)}
          sx={{ bgcolor: '#e2acf6', '&:hover': { bgcolor: '#cc6fee' }, textTransform: 'none', fontWeight: 700 }}
        >
          Download PDF
        </LoadingButton>
        <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.8)' }} size="small">
          <Close />
        </IconButton>
      </Box>

      {/* ── Report body ── */}
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          maxWidth: 960,
          mx: 'auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        {/* Cover card */}
        <ReportCard>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 2,
              marginTop: 8,
              marginRight: 8,
              marginBottom: 8,
              marginLeft: 8,
            }}
          >
            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ letterSpacing: 2, marginTop: 8, marginRight: 8, marginBottom: 8, marginLeft: 8 }}
              >
                AMRnet Report
              </Typography>
              <Typography variant="h4" fontWeight={800} lineHeight={1.1} sx={{ mt: 0.5 }}>
                <i>
                  {firstName} {secondName}
                </i>
              </Typography>
              {/* <Typography variant="h5" fontStyle="italic" color="text.secondary" lineHeight={1.2}></Typography> */}
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ mt: 1, marginTop: 8, marginRight: 8, marginBottom: 8, marginLeft: 8, display: 'block' }}
              >
                Generated {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </Box>
            <Box component="img" src={LogoImg} alt="AMRnet" sx={{ height: 48, opacity: 0.7 }} />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {metaChips.map(({ label, value }) => (
              <Box key={label} sx={{ px: 2, py: 1, bgcolor: '#f5f7fa', borderRadius: 1.5, minWidth: 130 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  {label}
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>
        </ReportCard>

        {/* Info text */}
        {texts && texts.filter(Boolean).length > 0 && (
          <ReportCard title={t('pdf.reportInformation')} accent={accentColor}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {texts.filter(Boolean).map((text, i) => {
                const isWarning = text.startsWith('WARNING');
                const isHeading =
                  !isWarning &&
                  text.length < 50 &&
                  (text.endsWith(':') || ['Variable definitions', 'Abbreviations', 'Source Data'].includes(text));
                return (
                  <Typography
                    key={i}
                    variant={isHeading ? 'subtitle2' : 'body2'}
                    sx={{
                      ...(isWarning && {
                        bgcolor: '#fff9c4',
                        borderLeft: '4px solid #f9a825',
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 0.5,
                        fontWeight: 700,
                        color: '#5d4037',
                      }),
                      ...(isHeading && { mt: 1.5, fontWeight: 700, color: '#1565c0' }),
                    }}
                  >
                    {text}
                  </Typography>
                );
              })}
            </Box>
          </ReportCard>
        )}

        {/* Map */}
        {mapImage && (
          <ReportCard title={`Global Overview — ${metadata.mapView}`} subtitle={metadata.organism} accent={accentColor}>
            <Box
              component="img"
              src={mapImage}
              alt="Global Map"
              sx={{ width: '100%', borderRadius: 1, display: 'block' }}
            />
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
          </ReportCard>
        )}

        {/* Pathotype / Serotype */}
        {bhpCapture?.dataUrl && (
          <ReportCard
            title={organism === 'sentericaints' ? 'Serotype Comparisons' : 'Pathotype Comparisons'}
            subtitle={metadata.mapView}
            accent={accentColor}
          >
            <Box
              component="img"
              src={bhpCapture.dataUrl}
              alt="Pathotype / Serotype"
              sx={{ width: '100%', borderRadius: 1, display: 'block' }}
            />
          </ReportCard>
        )}

        {/* Graph cards */}
        {graphs
          .filter(g => g.image)
          .map((g, i) => (
            <ReportCard
              key={i}
              title={g.title}
              subtitle={g.description?.filter(Boolean).join(' / ')}
              accent={accentColor}
            >
              <Box
                component="img"
                src={g.image}
                alt={g.title}
                sx={{ width: '100%', borderRadius: 1, display: 'block' }}
              />
            </ReportCard>
          ))}

        {/* Citation footer */}
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
