import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((_theme) => ({
  resetButton: {
    position: 'fixed',
    right: 16,
    bottom: 0,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'center',
    zIndex: 1,

    '@media (max-width: 500px)': {
      right: 8,
      padding: '16px 8px',
    },
  },
}));

export { useStyles };
