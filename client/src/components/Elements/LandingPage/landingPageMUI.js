import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  card: {
    '&.MuiCard-root': {
      borderRadius: '16px',
    },
    // minHeight: '500px'
  },
  cardContent: {
    margin: '0px 2%',
  },
  paragraph: {
    textAlign: 'justify',
  },
  teamHeading: {
    textAlign: 'center',
  },
  teamMember: {
  display: 'grid',           
  gridTemplateColumns: 'repeat(3, 1fr)',
  gridTemplateRows: 'repeat(3, auto)',   
  gap: '20px',              
  justifyContent: 'center',   
  alignItems: 'center',       
  margin: '20px',
},

  teamMemberImg: {
    width: '100%',
    height: '230px',
    objectFit: 'cover',
    borderRadius: 5,
  },
  teamPost: {
    textAlign: 'center',
    // color:"blue",
    // fontSize:"10px"
  },
  paragraphBold: {
    fontWeight: '550',
  },
}));

export { useStyles };
