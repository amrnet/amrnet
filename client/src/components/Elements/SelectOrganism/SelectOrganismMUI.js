import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((_theme) => ({
  organismSelectWrapper: {
    width: '100%',
    maxWidth: '800px',
    display: 'flex',
    alignItems: 'center',
  },
  organismSelect: {
    height: '36px',
    width: '100%',

    '@media (max-width: 500px)': {
      padding: '4px 0px',
    },

    '& .MuiSelect-select.MuiSelect-select': {
      height: '100%',
      borderRadius: '4px',
      justifyContent: 'center',
      alignItems: 'center',
      display: 'flex',
      fontSize: '18px',
      backgroundColor: 'rgba(0, 0, 0, 0.05)',

      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
      },

      '@media (min-width: 501px)': {
        padding: '4px !important',
      },

      '@media (max-width: 500px)': {
        fontSize: '16px',
      },
    },
  },
}));

export { useStyles };
