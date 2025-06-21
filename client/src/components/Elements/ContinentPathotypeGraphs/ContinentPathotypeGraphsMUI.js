import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  cardsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '16px',
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
  },
}));

export { useStyles };
