import { AppBar, IconButton, Toolbar, Tooltip } from '@mui/material';
import { useStyles } from './FooterMUI';
import { GitHub } from '@mui/icons-material';
import LSHTMLogoImg from '../../../assets/img/Sponsors/LSHTMLogo2020.jpg';
import WellcomeTrustLogoImg from '../../../assets/img/Sponsors/Wellcome_Trust_logo.png';

export const Footer = () => {
  const classes = useStyles();

  function handleClickGithub() {
    window.open('https://github.com/amrnet/amrnet', '_blank');
  }

  function handleClickLSHTM() {
    window.open('https://www.lshtm.ac.uk/amrnet', '_blank');
  }

  function handleClickWT() {
    window.open('http://wellcome.org', '_blank');
  }

  return (
    <AppBar position="static" className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        <div className={classes.logosWrapper}>
          <img
            className={classes.logo}
            onClick={handleClickLSHTM}
            src={LSHTMLogoImg}
            alt="LSHTM Logo"
            loading="lazy"
            height={60}
          />
          <img
            className={classes.logo}
            onClick={handleClickWT}
            src={WellcomeTrustLogoImg}
            alt="Wellcome Trust Logo"
            loading="lazy"
            height={60}
          />
        </div>
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
