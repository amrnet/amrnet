import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((_theme) => ({
  bottomLeftControls: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
}));

export { useStyles };
