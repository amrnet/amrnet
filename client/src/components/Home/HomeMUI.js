import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  card: {
    '&.MuiCard-root': {
      borderRadius: '16px',
    },
  },

  cardContent: {
    margin: '8px 16px',
  },

  title: {
    paddingBottom: '16px',
  },

  legend: {
    paddingBottom: '16px',
    maxWidth: '750px',
  },

  organisms: {
    padding: '0px !important',
  },

  organismCard: {
    borderRadius: '0px !important',

    '&$mobile': {
      display: 'flex',
      flexDirection: 'row',
      borderRadius: '4px !important',
    },
  },

  organismLink: {
    textDecoration: 'none',
  },

  organismLegend: {
    bottom: 0,
    left: 0,
    right: 0,
    padding: '10px',
    textAlign: 'center',
    opacity: 0.9,
    width: '100%',
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'column',
  },

  mobile: {},
}));

export { useStyles };
