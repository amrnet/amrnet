import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((_theme) => ({
  card: {
    '&.MuiCard-root': {
      borderRadius: '16px',
    },
    minHeight: '500px',
  },
  cardContent: {
    margin: '0px 2%',
  },
  paragraph: {
    textAlign: 'justify',
  },
  paragraphBold: {
    fontWeight: 'bold',
  },
}));

export { useStyles };
