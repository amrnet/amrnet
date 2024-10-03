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
  gap: '20px',              
  justifyContent: 'center', 
  
  // alignItems: 'center',       
  margin: '20px',
  '@media (min-width: 500px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridTemplateRows: 'repeat(2, auto)', 
    },
  '@media (min-width: 750px)': {
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: 'repeat(3, auto)', 
    },
    
  },
  teamMemberDiv: {
    display: 'grid',           
    gap: '20px',              
    justifyContent: 'center', 
    // alignItems: 'center',       
    margin: '20px',
    '@media (max-width: 500px)': {
      justifyContent: 'left', 
      gap: '0px',              
      margin: '0px',
      textWrap:'nowrap',
      textDecoration:"underline"
      },
    },

  
  teamMemberImg: {
    width: '100%',
    height: '230px',
    objectFit: 'cover',
    borderRadius: 5,
    '@media (max-width: 500px)': {
    width: '0%',
    height: '0px',
    },
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
