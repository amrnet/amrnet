import { Box, Grow } from '@mui/material';

export const PlottingOptionsPanel = ({ show, className, children }) => (
  <Grow in={show} timeout={{ enter: 300, exit: 200 }} unmountOnExit mountOnEnter>
    <Box className={className} style={{ transformOrigin: 'top center' }}>
      {children}
    </Box>
  </Grow>
);
