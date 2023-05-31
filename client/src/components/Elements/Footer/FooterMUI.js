import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  appBar: {
    borderRadius: '16px',
    backgroundColor: '#fff !important'
  },
  toolbar: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    display: 'grid !important',
    gap: '8px',
    gridTemplateColumns: 'repeat(12, 1fr)',
    padding: '16px 16px 24px !important',
    margin: '0px 2%',

    '&$bp700': {
      '& $information': {
        gridColumn: 'span 12',
        textAlign: 'start'
      },
      '& $socialsWrapper': {
        gridColumn: ' 7 / span 6',
        gridRow: '1'
      },
      '& $logosWrapper': {
        gridColumn: 'span 6'
      }
    }
  },
  socialsWrapper: {
    display: 'flex',
    columnGap: '4px',
    gridColumn: 'span 4',
    justifyContent: 'flex-end'
  },
  logosWrapper: {
    gridColumn: 'span 4',
    display: 'flex',
    columnGap: '8px'
  },
  information: {
    gridColumn: 'span 4',
    textAlign: 'center'
  },
  bp700: {}
}));

export { useStyles };
