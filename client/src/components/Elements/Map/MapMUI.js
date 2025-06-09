import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  mapWrapper: { position: 'relative' },
  card: {
    '&.MuiCard-root': {
      borderRadius: '16px',
      overflow: 'visible',
    },
  },
  cardContent: {
    textAlign: 'center',
    position: 'relative',
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
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
  },
  composableMap: {
    height: '500px',
    width: '100%',

    '@media (max-width: 500px)': {
      height: '300px',
    },
  },
  tooltipMap: {
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '4px',
    alignItems: 'flex-start',

    '& $country': {
      fontWeight: 500,
      fontSize: '18px',
    },

    '& $tooltipInfo': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',

      '& $info': {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',

        '& $color': {
          width: '10px',
          height: '10px',
          marginRight: '4px',
          border: '1px solid #f5f4f6',
        },
      },
    },
  },
  topControls: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    rowGap: '16px',
  },
  country: {},
  tooltipInfo: {},
  info: {},
  color: {},
}));

export { useStyles };
