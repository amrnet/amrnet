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
  toolbar_mobile: {
    columnGap: '0px !important',
    paddingRight:'0px !important'
  },

  item: {
    color: '#730343 !important',
    // fontSize:"10px !important"
  },
  item_mobile: {
    color: '#730343 !important',
    fontSize:"10px !important"
  },
}));

export { useStyles };
