import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  card: {
    '&.MuiCard-root': {
      borderRadius: '16px',
    },
    // minHeight: '500px'
  },
  cardContent: {
    // margin: '0px 2%',
  },
  paragraph: {
    textAlign: 'justify',
  },
  teamHeading: {
    textAlign: 'center',
  },
  teamMember: {
    display: 'grid',           
    justifyContent: 'center', 
    padding:'0px !important',

    
    '@media (min-width: 500px)': {
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, auto)', 
      },
    '@media (min-width: 750px)': {
        gridTemplateColumns: 'repeat(4, 1fr)',
      },
    },
  teamMemberDiv: {
    display: 'grid',           
    gap: '20px',    
    position: 'relative',
    zIndex: '1', /* Ensure it sits behind the typography */
              
    justifyContent: 'center', 
    '@media (max-width: 500px)': {
      justifyContent: 'left', 
      gap: '0px',              
      margin: '0px',
      textWrap:'nowrap',
      textDecoration:"underline",
      backgroundColor:'unset',
      },

    
  },

  overlay:{
    position: 'relative',
    width: '100%',
    textAlign: 'center',
    '@media (max-width: 500px)': {
        height:'45px',
        overflow:'clip'
    },

    '&:hover': {
      zIndex: '2',  
      transform: 'scale(1.05)',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
      backgroundColor: '#fce4ec',  // Optional: change background color on hover
    },
    '&:focus': {
        transform: 'scale(1.05)',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
        backgroundColor: '#fce4ec',  // Optional: change background color on focus
    },
    '@media (pointer: coarse)': {
        ':active': {
            transform: 'scale(1.05)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            backgroundColor: '#fce4ec',  // Optional: change background color on touch
        },
    },
  },

  typographyWrapper: {
    position: 'absolute',
    bottom: '0',  /* Align to the bottom of the container */
    width: '100%',  /* Span across the full width */
    zIndex: '2',  /* Ensure it overlaps the image */
    backgroundColor: 'rgba(0, 0, 0,1)',  /* Cyan background */
    textAlign: 'center',
    color:'white',
  },

  typography: {
    fontWeight: 'bold !important',  /* Bold text */
    padding: '10px 0 ', /* Padding for spacing */
  },
  
  teamMemberImg: {
    width: '100%',
    height: '300px',
    objectFit: 'cover',
    // borderRadius: 5,
    '@media (max-width: 500px)': {
    width: '0%',
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
