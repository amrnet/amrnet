import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  card: {
    '&.MuiCard-root': {
      borderRadius: '16px'
    }
    // minHeight: '500px'
  },
  cardContent: {
    margin: '0px 2%'
  },
  paragraph: {
    textAlign: 'justify'
  },
  teamHeading: {
    textAlign: 'center'
  },
  teamMember: {
    width: 270,
    height: 200,
    border: '2px solid gray',
    borderRadius: '5px',
    padding: '20px',
    margin: '20px !important'
  }
}));

export { useStyles };
