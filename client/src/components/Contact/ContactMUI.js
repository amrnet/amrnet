import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  card: {
    '&.MuiCard-root': {
      borderRadius: '16px'
    },
    minHeight: '500px'
  },
  cardContent: {
    maxWidth: '600px',
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    padding: '50px !important',

    '@media (max-width: 500px)': {
      padding: '24px !important'
    }
  },
  row: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',

    '@media (max-width: 600px)': {
      flexDirection: 'column'
    }
  },
  submitButton: {
    marginTop: '16px !important',
    height: '50px',
    color: '#fff !important'
  }
}));

export { useStyles };
