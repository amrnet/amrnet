import { AppBar, IconButton, Toolbar, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { useStyles } from './FooterMUI';
import { GitHub } from '@mui/icons-material';

export const Footer = () => {
  const classes = useStyles();
  const matches = useMediaQuery('(max-width:700px)');

  function handleClickGithub() {
    window.open('https://github.com/amrnet', '_blank');
  }

  return (
    <AppBar position="static" className={classes.appBar}>
      <Toolbar className={`${classes.toolbar} ${matches ? classes.bp700 : ''}`}>
        <div className={classes.logosWrapper}>
          <img
            src="https://upload.wikimedia.org/wikipedia/en/6/6f/LSHTMLogo2020.svg"
            alt="LSHTM"
            loading="lazy"
            height={60}
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/58/Wellcome_Trust_logo.svg"
            alt="Wellcome Trust"
            loading="lazy"
            height={60}
          />
        </div>
        <Typography className={classes.information} variant="h6">
          open source code project
        </Typography>
        <div className={classes.socialsWrapper}>
          <Tooltip title="Github" placement="top">
            <IconButton onClick={handleClickGithub}>
              <GitHub fontSize="large" />
            </IconButton>
          </Tooltip>
        </div>
      </Toolbar>
    </AppBar>
  );
};
