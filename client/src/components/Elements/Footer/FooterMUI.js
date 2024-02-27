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
    margin: '0px 2%'
  },
  socialsWrapper: {
    display: 'flex',
    columnGap: '4px',
    gridColumn: 'span 6',
    justifyContent: 'flex-end'
  },
  logosWrapper: {
    gridColumn: 'span 6',
    display: 'flex',
    columnGap: '8px'
  },
  logo: {
    cursor: 'pointer'
  }
}));

export { useStyles };
