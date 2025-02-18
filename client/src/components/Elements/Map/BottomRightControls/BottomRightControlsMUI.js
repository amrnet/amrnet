import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  bottomRightControls: {
    display: 'flex',
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  actionButton: {
    width: '45px',
  },
}));

export { useStyles };
