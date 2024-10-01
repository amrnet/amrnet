import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  
  headDiv: {
    display: 'flex', 
    width:'-webkit-fill-available', 
    justifyContent:'end', 
    // '@media (min-width: 650px)': {
    //   gap:'40px',
    // },

    '@media (max-width: 450px)': {
        fontSize:'x-small'
    },
    
  },
  itemDiv: {
    padding: '10px', 
    alignItems: 'center', 
    fontWeight:'500'
  },
  

  
}));

export { useStyles };
