import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  activeItem: {
    '&.MuiListItemButton-root': {
      backgroundColor: '#1fbbd3',
      color: '#fff'
    },
    '&.MuiListItemButton-root:hover': {
      backgroundColor: '#1fbbd3'
    }
  },
  activeItemIcon: {
    '&.MuiListItemIcon-root': {
      color: '#fff'
    }
  }
}));

export { useStyles };
