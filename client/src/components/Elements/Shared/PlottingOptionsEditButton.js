import { Edit } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

export const PlottingOptionsEditButton = forwardRef(({ active, onClick }, ref) => {
  const { t } = useTranslation();
  return (
    <Tooltip title={t('common.editPlottingOptions')} placement="top">
      <IconButton
        ref={ref}
        size="small"
        color={active ? 'primary' : 'default'}
        onClick={onClick}
        sx={{ borderRadius: '50%' }}
      >
        <Edit fontSize="small" />
      </IconButton>
    </Tooltip>
  );
});
PlottingOptionsEditButton.displayName = 'PlottingOptionsEditButton';
