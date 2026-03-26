import { Share, ContentCopy, Check } from '@mui/icons-material';
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Box,
} from '@mui/material';
import { useState } from 'react';

const ORGANISM_NAMES = {
  styphi: 'Salmonella Typhi', kpneumo: 'Klebsiella pneumoniae', ngono: 'Neisseria gonorrhoeae',
  ecoli: 'Escherichia coli', decoli: 'E. coli (diarrheagenic)', shige: 'Shigella + EIEC',
  senterica: 'Salmonella enterica', sentericaints: 'Salmonella (invasive)',
  saureus: 'Staphylococcus aureus', strepneumo: 'Streptococcus pneumoniae',
};

export const ShareButton = ({ organism = '', section = '', size = 'small' }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [copied, setCopied] = useState(false);

  const name = ORGANISM_NAMES[organism] || organism;
  const siteURL = 'https://www.amrnet.org';
  const shareText = `Check out ${section} for ${name} on AMRnet — interactive genome-derived AMR surveillance.\n\n`;

  const handleClick = (e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); };
  const handleClose = () => setAnchorEl(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(siteURL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    handleClose();
  };

  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(siteURL)}`, '_blank', 'width=600,height=400');
    handleClose();
  };

  const handleLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteURL)}`, '_blank', 'width=600,height=400');
    handleClose();
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + siteURL)}`, '_blank');
    handleClose();
  };

  const handleEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(`AMRnet: ${section} — ${name}`)}&body=${encodeURIComponent(shareText + siteURL)}`;
    handleClose();
  };

  return (
    <>
      <Tooltip title="Share" placement="top">
        <IconButton color="primary" onClick={handleClick} size={size}>
          <Share fontSize={size === 'small' ? 'small' : 'medium'} />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleCopy}>
          <ListItemIcon>{copied ? <Check fontSize="small" color="success" /> : <ContentCopy fontSize="small" />}</ListItemIcon>
          <ListItemText>{copied ? 'Copied!' : 'Copy link'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleTwitter}>
          <ListItemIcon><Box component="span" sx={{ fontSize: '18px' }}>𝕏</Box></ListItemIcon>
          <ListItemText>Twitter / X</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleLinkedIn}>
          <ListItemIcon><Box component="span" sx={{ fontSize: '16px', fontWeight: 700, color: '#0077b5' }}>in</Box></ListItemIcon>
          <ListItemText>LinkedIn</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleWhatsApp}>
          <ListItemIcon><Box component="span" sx={{ fontSize: '16px' }}>💬</Box></ListItemIcon>
          <ListItemText>WhatsApp</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEmail}>
          <ListItemIcon><Box component="span" sx={{ fontSize: '16px' }}>📧</Box></ListItemIcon>
          <ListItemText>Email</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
