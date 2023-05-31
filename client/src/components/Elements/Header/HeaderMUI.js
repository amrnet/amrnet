import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  headerWrapper: {
    position: 'fixed',
    top: 0,
    width: '-webkit-fill-available',
    display: 'flex',
    alignItems: 'center',
    zIndex: 2,
    backgroundColor: '#E5E5E5',
    borderRadius: '0px 0px 16px 16px',
    flexDirection: 'column',
    maxWidth: '1280px',
    margin: '0px 16px',

    '@media (max-width: 500px)': {
      margin: '0px 8px'
    }
  },
  headerBox: {
    width: '100%',
    height: '32px',
    marginBottom: '-16px',
    backgroundColor: '#E5E5E5',
    paddingLeft: '32px',

    '@media (max-width: 500px)': {
      paddingLeft: '16px',
      height: '24px'
    }
  },
  appBar: {
    borderRadius: '16px'
  },
  toolbar: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    flexDirection: 'column',
    minHeight: '0 !important',

    '@media (max-width: 500px)': {
      paddingTop: '8px',
      paddingBottom: '8px'
    },

    '&$otherPage': {
      flexDirection: 'row',
      justifyContent: 'space-between',

      '& $leftWrapper': {
        justifyContent: 'space-between'
      }
    }
  },
  logo: {
    height: '80px',
    padding: '8px 0px',

    '@media (max-width: 1000px)': {
      height: '60px'
    },

    '@media (max-width: 500px)': {
      height: '40px'
    }
  },
  leftWrapper: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    columnGap: '10px'
  },
  drawerTitleWrapper: {
    display: 'flex',
    alignItems: 'center'
  },
  toolbarWrapper: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    '@media (min-width: 651px) and (max-width: 1000px)': {
      flexDirection: 'column'
    },

    '@media (max-width: 650px)': {
      columnGap: '4px'
    },

    '@media (max-width: 500px)': {
      justifyContent: 'flex-end'
    }
  },
  infoCollapse: {
    width: '100%'
  },
  title: {
    position: 'absolute'
  },
  otherPage: {
    height: '-webkit-fill-available'
  }
}));

export { useStyles };
