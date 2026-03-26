import { CameraAlt, Download, Share, ContentCopy, Check } from '@mui/icons-material';
import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import domtoimage from 'dom-to-image';
import downloadjs from 'downloadjs';
import { useState } from 'react';

/**
 * Convert array of objects to TSV string
 */
function arrayToTSV(data, columns) {
  if (!data || data.length === 0) return '';
  const cols = columns || Object.keys(data[0]);
  const header = cols.join('\t');
  const rows = data.map(row => cols.map(col => {
    const val = row[col];
    if (val == null) return '';
    return String(val).replace(/\t/g, ' ').replace(/\n/g, ' ');
  }).join('\t'));
  return [header, ...rows].join('\n');
}

/**
 * Download data as TSV file
 */
export function downloadTSV(data, filename, columns) {
  const tsv = arrayToTSV(data, columns);
  if (!tsv) return;
  const blob = new Blob([tsv], { type: 'text/tab-separated-values;charset=utf-8' });
  downloadjs(blob, `${filename}.tsv`, 'text/tab-separated-values');
}

/**
 * Download DOM element as PNG
 */
export async function downloadPNG(elementId, filename) {
  const element = document.getElementById(elementId);
  if (!element) return;
  const dataUrl = await domtoimage.toPng(element, { quality: 0.95, bgcolor: '#ffffff' });
  downloadjs(dataUrl, `${filename}.png`);
}

/**
 * Build a shareable URL with current organism and view
 */
function buildShareURL(organism, tab) {
  const base = window.location.origin + window.location.pathname;
  return `${base}#/dashboard?organism=${organism}&insights=${tab}`;
}

/**
 * Build share text
 */
function buildShareText(organism, tabLabel) {
  const organismNames = {
    styphi: 'Salmonella Typhi', kpneumo: 'Klebsiella pneumoniae', ngono: 'Neisseria gonorrhoeae',
    ecoli: 'Escherichia coli', decoli: 'E. coli (diarrheagenic)', shige: 'Shigella + EIEC',
    senterica: 'Salmonella enterica', sentericaints: 'Salmonella (invasive)', saureus: 'Staphylococcus aureus',
    strepneumo: 'Streptococcus pneumoniae',
  };
  const name = organismNames[organism] || organism;
  return `Check out ${tabLabel} for ${name} on AMRnet — genome-derived AMR surveillance data.\n\n`;
}

/**
 * InsightsActions — Download CSV + Download PNG + Share buttons
 *
 * @param {Object} props
 * @param {Array} props.csvData - Array of objects to export as CSV
 * @param {string} props.csvFilename - Filename for CSV download (without extension)
 * @param {Array} [props.csvColumns] - Column order for CSV (optional)
 * @param {string} props.pngElementId - DOM element ID for PNG screenshot
 * @param {string} props.pngFilename - Filename for PNG download
 * @param {string} props.organism - Current organism
 * @param {string} props.currentTab - Current tab value
 * @param {string} props.tabLabel - Human-readable tab label
 */
export const InsightsActions = ({
  csvData,
  csvFilename = 'amrnet_data',
  csvColumns,
  pngElementId = 'amr-insights-content',
  pngFilename = 'amrnet_insights',
  organism = '',
  currentTab = '',
  tabLabel = 'AMR Insights',
}) => {
  const [shareAnchor, setShareAnchor] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [copied, setCopied] = useState(false);

  const shareURL = buildShareURL(organism, currentTab);
  const shareText = buildShareText(organism, tabLabel);

  const handleDownloadCSV = (e) => {
    e.stopPropagation();
    if (!csvData || csvData.length === 0) {
      setSnackbar({ open: true, message: 'No data to download', severity: 'warning' });
      return;
    }
    downloadTSV(csvData, csvFilename, csvColumns);
  };

  const handleDownloadPNG = async (e) => {
    e.stopPropagation();
    try {
      await downloadPNG(pngElementId, pngFilename);
    } catch {
      setSnackbar({ open: true, message: 'Failed to capture image', severity: 'error' });
    }
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    setShareAnchor(e.currentTarget);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareURL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    setShareAnchor(null);
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent('https://www.amrnet.org')}`;
    window.open(url, '_blank', 'width=600,height=400');
    setShareAnchor(null);
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://www.amrnet.org')}`;
    window.open(url, '_blank', 'width=600,height=400');
    setShareAnchor(null);
  };

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + 'https://www.amrnet.org')}`;
    window.open(url, '_blank');
    setShareAnchor(null);
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`AMRnet: ${tabLabel} for ${organism}`);
    const body = encodeURIComponent(shareText + 'https://www.amrnet.org');
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShareAnchor(null);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Tooltip title="Download data (TSV)" placement="top">
        <span>
          <IconButton color="primary" onClick={handleDownloadCSV} disabled={!csvData || csvData.length === 0} size="small">
            <Download fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Download chart (PNG)" placement="top">
        <IconButton color="primary" onClick={handleDownloadPNG} size="small">
          <CameraAlt fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Share" placement="top">
        <IconButton color="primary" onClick={handleShareClick} size="small">
          <Share fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu anchorEl={shareAnchor} open={Boolean(shareAnchor)} onClose={() => setShareAnchor(null)}>
        <MenuItem onClick={handleCopyLink}>
          <ListItemIcon>{copied ? <Check fontSize="small" color="success" /> : <ContentCopy fontSize="small" />}</ListItemIcon>
          <ListItemText>{copied ? 'Copied!' : 'Copy link'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleShareTwitter}>
          <ListItemIcon><Box component="span" sx={{ fontSize: '18px' }}>𝕏</Box></ListItemIcon>
          <ListItemText>Twitter / X</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleShareLinkedIn}>
          <ListItemIcon><Box component="span" sx={{ fontSize: '16px', fontWeight: 700, color: '#0077b5' }}>in</Box></ListItemIcon>
          <ListItemText>LinkedIn</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleShareWhatsApp}>
          <ListItemIcon><Box component="span" sx={{ fontSize: '16px' }}>💬</Box></ListItemIcon>
          <ListItemText>WhatsApp</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleShareEmail}>
          <ListItemIcon><Box component="span" sx={{ fontSize: '16px' }}>📧</Box></ListItemIcon>
          <ListItemText>Email</ListItemText>
        </MenuItem>
      </Menu>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};
