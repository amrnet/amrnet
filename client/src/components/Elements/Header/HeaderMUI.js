import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
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

    // '@media (min-width: 651px) and (max-width: 1000px)': {
    //   flexDirection: 'column',
    // },


    '&$otherPage': {
      flexDirection: 'row',
      justifyContent: 'space-between',

      '& $leftWrapper': {
        justifyContent: 'space-between',
      },
    },
  },
  // dashboardHead: {  // Conditional style that applies when `dashboard` class is present
  //     '@media (min-width: 651px) and (max-width: 1000px)': {
  //       flexDirection: 'column',
  //       backgroundColor:"red"
  //     },
      
  //   },
  // landingPageHeadOnly:{
  //   '@media (max-width: 700px)': {
  //       width: '0%',
        
  //   },
  // },

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
    columnGap: '10px',
  },

  drawerTitleWrapper: {
    display: 'flex',
    alignItems: 'center',
  },

  toolbarWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    

    '@media (max-width: 650px)': {
      columnGap: '4px',
      display: 'flex',
    },

    '@media (min-width: 1000px)':{
      display: 'flex',
    },

    '@media (max-width: 500px)': {
      justifyContent: 'flex-end',
    },
  },
  flex:{
    display: 'flex',
  },

  infoCollapse: {
    width: '100%',
  },

  title: {
    position: 'absolute',
  },

  otherPage: {},
}));

export { useStyles };
