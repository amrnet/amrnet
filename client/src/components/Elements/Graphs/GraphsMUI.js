import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((_theme) => ({
  cardsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '16px',
    position: 'relative',

    '@media (max-width: 500px)': {
      rowGap: '8px',
    },
  },
  card: {
    '&.MuiCard-root': {
      borderRadius: '16px',
      overflow: 'visible',
    },
  },
  cardActions: {
    display: 'flex',
    columnGap: '8px',
    justifyContent: 'space-between',
    padding: '16px !important',
  },
  titleWrapper: {
    display: 'flex',
    columnGap: '8px',
  },
  title: {
    display: 'flex',
    flexDirection: 'column',
  },
  actionsWrapper: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
  },
  boxWrapper: {
    position: 'relative',
    zIndex: 1,
  },
  loadingBlock: {
    display: 'flex',
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '0 0 16px 16px',
    backgroundColor: 'white',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

export { useStyles };
