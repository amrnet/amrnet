import { Close } from '@mui/icons-material';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const PlottingOptionsHeader = ({ onClose, className }) => {
  const { t } = useTranslation();

  return (
    <div className={className}>
      <Typography variant="h6">{t('dashboard.filters.plotOptions.title')}</Typography>
      <Tooltip title={t('dashboard.filters.plotOptions.hideTooltip')} placement="top">
        <IconButton onClick={onClose}>
          <Close fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  );
};
