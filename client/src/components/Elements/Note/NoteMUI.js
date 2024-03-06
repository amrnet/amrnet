import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  card: {
    '&.MuiCard-root': {
      borderRadius: '16px'
    }
  },
  cardContent: {
    // flexDirection: 'column',
    alignItems: 'left',
    rowGap: '8px',
    '@media (max-width: 500px)': {
      display: 'contents'
    },
    '@media (min-width: 501px)': {
      display: 'flex'
    }
  },
  selectInput: {
    fontSize: '16px !important',
    fontWeight: '600 !important',
    textAlign: 'start',
    minWidth: '250px !important'
  },
  selectMenu: {
    '& .MuiMenuItem-root': {
      fontSize: '16px'
    }
  },
  menuPaper: {
    maxHeight: '350px !important'
  },
  beta: {
    // width:"30px !important",
    height: '40px',
    backgroundColor: '#ADDD8E !important',
    '@media (max-width: 500px)': {
      width: '100% !important'
    }
  },
  note: {
    '@media (max-width: 500px)': {
      textAlign: 'justify',
      margin: '10px !important'
    },
    '@media (min-width: 501px)': {
      marginLeft: '20px !important',
      margin: 'auto !important'
    }
    // backgroundColor: "blue !important"
  },
  logo: {
    width: '150px',
    '@media (max-width: 500px)': {
      display: 'flex',
      margin: 'auto'
    }
  }
}));

export { useStyles };
