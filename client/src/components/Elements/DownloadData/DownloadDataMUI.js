import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  downloadDataWrapper: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '16px 0px',

    '@media (max-width: 500px)': {
      padding: '8px 0px',
    },

    '@media (max-width: 700px)': {
      flexDirection: 'column',
      rowGap: '8px',
    },
  },
  button: {
    color: '#fff !important',
    width: '30%',
    textTransform: 'none !important',
    paddingTop: '8px !important',
    paddingBottom: '8px !important',
    borderRadius: '100px !important',

    '@media (max-width: 700px)': {
      width: '100%',
    },
  },
}));

export { useStyles };
