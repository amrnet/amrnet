import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
  menuHead: {
    display: 'flex',
    width: '-webkit-fill-available',
    justifyContent: 'end',
  },

  toolbar: {
    columnGap: '24px',
  },

  item: {
    color: 'black',
  },
}));

export { useStyles };
