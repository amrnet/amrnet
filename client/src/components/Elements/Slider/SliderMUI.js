import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  sliderLabel: {
    display: 'flex',
    fontSize: '12px',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  sliderSize: {
    '& .MuiSlider-valueLabel': {
      fontSize: 12,
      fontWeight: '600',
      top: 24,
      backgroundColor: 'unset',
      color: 'white',
      '&::before': {
        display: 'none',
      },
    },
    '& .MuiSlider-thumb': {
      height: 25,
      width: 25,
    },
  },
}));

export { useStyles };
