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
    color: '#730343 !important',
  },
}));

export { useStyles };
