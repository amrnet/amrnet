import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((_theme) => ({
  headerWrapper: {
    position: 'fixed',
    top: 0,
    // width: '100%', // Default width
    '@supports (-webkit-appearance:none)': {
      // Safari and Chrome
      width: '-webkit-fill-available',
    },
    '@supports (-moz-appearance:none)': {
      // Firefox
      width: '-moz-available',
    },
    display: 'flex',
    alignItems: 'center',
    zIndex: 5,
    backgroundColor: '#E5E5E5',
    borderRadius: '0px 0px 16px 16px',
    flexDirection: 'column',
    maxWidth: '1280px',
    margin: '0px 16px',

    '@media (max-width: 500px)': {
      margin: '0px 8px',
    },
  },

  headerBox: {
    width: '100%',
    height: '32px',
    marginBottom: '-16px',
    backgroundColor: '#E5E5E5',
    paddingLeft: '32px',

    '@media (max-width: 500px)': {
      paddingLeft: '16px',
      height: '24px',
    },
  },

  appBar: {
    borderRadius: '16px',
    backgroundColor: '#E5E5',
  },

  toolbar: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    flexDirection: 'column',
    minHeight: '0 !important',
    display: 'block',

    '@media (max-width: 500px)': {
      paddingTop: '8px',
      paddingBottom: '8px',
    },
  },

  logo: {
    height: '80px',
    padding: '8px 0px',
    alignContent: 'center',

    '@media (max-width: 1000px)': {
      height: '60px',
    },

    '@media (max-width: 500px)': {
      height: '40px',
    },
  },

  leftWrapper: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    columnGap: '16px',
  },

  drawerTitleWrapper: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
  },

  toolbarWrapper: {
    width: '100%',
    // display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: '8px',

    '@media (max-width: 650px)': {
      columnGap: '4px',
    },

    '@media (max-width: 500px)': {
      justifyContent: 'flex-end',
    },
  },

  dashboardHead: {
    // Conditional style that applies when `dashboard` class is present
    display: 'flex',
  },
  defaultHead: {
    display: 'flex',
    '@media (min-width: 651px) and (max-width: 1000px)': {
      display: 'block',
    },
  },
  homeHead: {
    display: 'flex',
  },

  infoCollapse: {
    width: '100%',
  },

  title: {
    position: 'absolute',
  },
}));

export { useStyles };
