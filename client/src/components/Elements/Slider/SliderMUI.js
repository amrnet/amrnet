import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  sliderLabel:{
    display:'flex', 
    fontSize:'12px', 
    justifyContent:'space-between', 
    flexDirection:'row'
  },
  sliderSize:{ 
    margin: '0px 10px'
  }
}));

export { useStyles };
