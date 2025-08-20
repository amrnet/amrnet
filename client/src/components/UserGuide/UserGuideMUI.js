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
    // textAlign: 'justify',
    fontSize: '10px',
  },
  paragraphBold: {
    fontWeight: '550',
  },
  imageContainer: {
    width: '100%',
    height: '0',
    paddingTop: '56.25%',
    position: 'relative',
    // overflow: 'hidden',
  },
  img:{
    '@supports (-webkit-appearance:none)': {
      // Safari and Chrome
      maxWidth: '-webkit-fill-available',
    },
    '@supports (-moz-appearance:none)': {
      // Firefox
      maxWidth: '-moz-available',
    },
  }
}));

export { useStyles };
