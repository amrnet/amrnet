import { Box, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BrazilFlag, FranceFlag, SpainFlag, UKFlag } from './FlagIcons';

/**
 * LanguageSwitcher Component
 *
 * A dropdown component that allows users to switch between different languages.
 * Displays country flags alongside language names for better UX.
 *
 * @component
 * @example
 * return (
 *   <LanguageSwitcher />
 * )
 */
const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const languages = [
    { code: 'en', name: 'English', flag: UKFlag },
    { code: 'fr', name: 'Français', flag: FranceFlag },
    { code: 'pt', name: 'Português (BR)', flag: BrazilFlag },
    { code: 'es', name: 'Español', flag: SpainFlag },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  /**
   * Handles opening the language menu
   * @param {Event} event - The click event
   */
  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * Handles closing the language menu
   */
  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   * Changes the application language
   * @param {string} languageCode - The language code to switch to
   */
  const changeLanguage = languageCode => {
    i18n.changeLanguage(languageCode);
    handleClose();
  };

  return (
    <Box>
      <IconButton
        onClick={handleClick}
        size="small"
        aria-controls={open ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        aria-label={t('settings.language')}
        sx={{
          padding: 1,
          borderRadius: 2,
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <currentLanguage.flag width={20} height={15} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {currentLanguage.code.toUpperCase()}
          </Typography>
        </Box>
      </IconButton>

      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'language-button',
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {languages.map(language => (
          <MenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            selected={language.code === i18n.language}
            sx={{
              minWidth: 160,
              padding: '8px 16px',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <language.flag width={20} height={15} />
              <Typography variant="body2">{language.name}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default LanguageSwitcher;
