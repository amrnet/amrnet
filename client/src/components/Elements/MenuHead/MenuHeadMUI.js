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
    color: 'black !important',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.1) !important', // Darker shade for hover
    },
  },
}));

export { useStyles };
