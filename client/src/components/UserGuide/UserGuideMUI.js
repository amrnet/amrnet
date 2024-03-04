import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  card: {
    '&.MuiCard-root': {
      borderRadius: '16px'
    },
    minHeight: '500px'
  },
  cardContent: {
    margin: '0px 2%'
  },
  paragraph: {
    textAlign: 'justify',
    fontSize:'10px'
  },
  paragraphBold: {
    fontWeight: '550'
  }
}));

export { useStyles };
