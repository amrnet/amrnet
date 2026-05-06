import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles(_theme => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '8px',
  },
  tabsBar: {
    minHeight: '36px',
    '& .MuiTab-root': {
      minHeight: '36px',
      textTransform: 'none',
      fontSize: '14px',
      fontWeight: 500,
    },
  },
  tab: {},
  card: {
    '&.MuiCard-root': {
      borderRadius: '16px',
      overflow: 'visible',
    },
  },
  emptyState: {
    padding: '48px 24px',
    minHeight: '160px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
