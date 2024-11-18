import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
  menuHead: {
    display: 'flex',
    width: '-webkit-fill-available',
    justifyContent: 'end',
    minWidth: "max-content",
  },

  toolbar: {
    columnGap: '0px',
  },

  item: {
    color: 'black !important',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.1) !important', // Darker shade for hover
    },
  },
}));

export { useStyles };
