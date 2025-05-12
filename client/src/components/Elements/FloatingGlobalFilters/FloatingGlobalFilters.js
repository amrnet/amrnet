import { useEffect, useMemo, useState } from 'react';
import { useStyles } from './FloatingGlobalFiltersMUI';
import { TopLeftControls } from '../Map/TopLeftControls';
import { Fab, IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { Close, FilterList } from '@mui/icons-material';
import { useAppSelector } from '../../../stores/hooks';

export const FloatingGlobalFilters = () => {
  const classes = useStyles();
  const matches500 = useMediaQuery('(max-width: 500px)');
  const matches700 = useMediaQuery('(max-width: 700px)');
  const matches1750 = useMediaQuery('(max-width: 1750px)');

  const organism = useAppSelector((state) => state.dashboard.organism);
  const loadingData = useAppSelector((state) => state.dashboard.loadingData);
  const loadingMap = useAppSelector((state) => state.map.loadingMap);

  const [left, setLeft] = useState(16);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showFilter, setShowFilter] = useState(!matches500);
  const [lastScrollTop, setLastScrollTop] = useState(0);

  useEffect(() => {
    const updateLeft = () => {
      const width = window.innerWidth;
      setLeft(Math.max((width - 1280) / 2 - 216, 16));
    };

    updateLeft();
    window.addEventListener('resize', updateLeft);
    return () => {
      window.removeEventListener('resize', updateLeft);
    };
  }, []);

  useEffect(() => {
    const scrollContainer = document.getElementById('main-layout');

    const handleScroll = () => {
      if (scrollContainer) {
        setScrollPosition(scrollContainer.scrollTop);
      }
    };

    scrollContainer?.addEventListener('scroll', handleScroll);
    return () => {
      scrollContainer?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // useEffect(() => {
  //   setShowFilter(!matches1750);
  // }, [matches1750]);

  // useEffect(() => {
  //   const scrollContainer = document.getElementById('main-layout');

  //   if (scrollContainer && matches1750) {
  //     const handleScroll = () => {
  //       const currentScrollTop = scrollContainer.scrollTop;

  //       if (currentScrollTop !== lastScrollTop) {
  //         setShowFilter(true);
  //       }
  //       setLastScrollTop(currentScrollTop);
  //     };

  //     scrollContainer.addEventListener('scroll', handleScroll);
  //     return () => scrollContainer.removeEventListener('scroll', handleScroll);
  //   }
  // }, [lastScrollTop, matches1750]);

  function handleClick() {
    setShowFilter(true);
  }

  const show = useMemo(() => {
    const position = matches500 ? 1000 : matches700 ? 1150 : 420;

    return !loadingData && !loadingMap && organism !== 'none' && scrollPosition > position;
  }, [loadingData, loadingMap, matches500, matches700, organism, scrollPosition]);

  return (
    <div>
      {(
        <>
          {showFilter && (
            <TopLeftControls
              style={{ top: 'unset', bottom: '16px', left }}
              title="Global Filters"
              closeButton={
                // matches1750 ? (
                  <Tooltip title="Hide Filters" placement="top">
                    <IconButton onClick={() => setShowFilter(false)}>
                      <Close fontSize="small" />
                    </IconButton>
                  </Tooltip>
                // ) : null
              }
            />
          )}
          {!showFilter && (
            <div className={classes.fabGF}>
              <Tooltip title="Global Filters" placement="right">
                <span>
                  <Fab
                    color="primary"
                    size={matches500 ? 'medium' : 'large'}
                    onClick={handleClick}
                    disabled={organism === 'none' || loadingData || loadingMap}
                  >
                    <FilterList sx={{ color: '#fff' }} />
                  </Fab>
                </span>
              </Tooltip>
            </div>
          )}
        </>
      )}
    </div>
  );
};
