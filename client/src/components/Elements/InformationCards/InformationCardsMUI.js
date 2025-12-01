import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((_theme) => ({
  cardsWrapper: {
    display: 'flex',
    columnGap: '16px',
    padding: '8px 0px',
    maxWidth: '420px',

    '@media (max-width: 1000px)': {
      width: '100%',
      justifyContent: 'space-between',
      padding: '8px 0px',
      maxWidth: '100%',
      borderTop: '1px solid rgba(0, 0, 0, 0.12)',
    },

    '@media (max-width: 650px)': {
      flexDirection: 'column',
      rowGap: '4px',
      padding: '0px 0px 8px',
    },
  },
  card: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  cardContent: {
    padding: '8px 16px !important',

    '@media (max-width: 1000px)': {
      display: 'flex',
      alignItems: 'flex-end',
      columnGap: '8px',
      padding: '0px 0px !important',
    },
  },
  title: {
    whiteSpace: 'nowrap',
    paddingBottom: '6px',

    '@media (max-width: 1000px)': {
      paddingBottom: '0px',
    },
  },
  titleCount: {
    lineHeight: 'normal !important',
  },
  actualAndTotalValues: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  bp1000: {},
}));

export { useStyles };
