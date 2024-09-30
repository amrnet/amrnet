import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  
  headDiv: {
    display: 'flex', 
    width:'-webkit-fill-available', 
    justifyContent:'end', 
    gap:'40px'
    
  },
  itemDiv: {
    padding: '10px', 
    alignItems: 'center', 
    fontWeight:'500'
  },
  

  
}));

export { useStyles };
