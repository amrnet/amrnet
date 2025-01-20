import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  fabGF: {
    position: 'fixed',
    left: 8,
    bottom: 0,
    padding: '16px',

    '@media (max-width: 500px)': {
      padding: '16px 8px',
    },
  },
}));

export { useStyles };
