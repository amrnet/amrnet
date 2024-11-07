import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  mainLayout: {
    width: '100%',
    backgroundColor: '#E5E5E5',
    display: 'flex',
    justifyContent: 'center',
    overflowY: 'auto',

    '& .MuiAppBar-root': {
      boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
    },
  },
  childrenWrapper: {
    width: '100%',
  },
  children: {
    padding: '128px 16px 16px',
    maxWidth: '1280px',
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
    rowGap: '16px',
    backgroundColor: '#E5E5E5',

    '@media (max-width: 1000px)': {
      padding: '108px 16px 16px',
    },

    '@media (max-width: 500px)': {
      padding: '88px 8px 8px',
      rowGap: '8px',
    },
  },
  childrenOrg: {

    '@media (max-width: 1000px)': {
      padding: '158px 16px 16px',
    },

  },
  loading: {
    position: 'absolute',
    bottom: 0,
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 9999,
  },
  logo: {
    height: '100px',
    alignSelf: 'center',
    paddingLeft: '20px',
  },
}));

export { useStyles };
