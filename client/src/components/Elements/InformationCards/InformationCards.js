import { Divider, Typography, useMediaQuery } from '@mui/material';
import { useStyles } from './InformationCardsMUI';
import { useAppSelector } from '../../../stores/hooks';
import { useMemo } from 'react';
import { graphCards } from '../../../util/graphCards';

export const InformationCards = () => {
  const classes = useStyles();
  const matches1000 = useMediaQuery('(max-width: 1000px)');
  const matches650 = useMediaQuery('(max-width: 650px)');

  const totalGenomes = useAppSelector((state) => state.dashboard.totalGenomes);
  const actualGenomes = useAppSelector((state) => state.dashboard.actualGenomes);
  const totalGenotypes = useAppSelector((state) => state.dashboard.totalGenotypes);
  const actualGenotypes = useAppSelector((state) => state.dashboard.actualGenotypes);
  const organism = useAppSelector((state) => state.dashboard.organism);

  const totalLabel = useMemo(() => {
    const lineageCard = graphCards.find((card) => card.title.toLowerCase().includes('lineage'));

    if (lineageCard?.organisms?.includes(organism)) {
      return 'Total Lineages';
    }
    return 'Total Genotypes';
  }, [organism]);

  return (
    <div className={classes.cardsWrapper}>
      <div className={classes.card}>
        <div className={classes.cardContent}>
          <Typography variant={matches650 ? 'body2' : 'body1'} component="div" className={classes.title}>
            {`Total Genomes${matches1000 ? ':' : ''}`}
          </Typography>
          <Typography variant={matches650 ? 'h6' : 'h5'} sx={{ fontWeight: '500' }}>
            {totalGenomes === actualGenomes ? (
              <>{totalGenomes}</>
            ) : (
              <span className={classes.actualAndTotalValues}>
                {actualGenomes}
                <Typography variant={matches650 ? 'body2' : 'body1'} sx={{ fontWeight: '500' }}>
                  /{totalGenomes}
                </Typography>
              </span>
            )}
          </Typography>
        </div>
      </div>
      {!matches650 && <Divider orientation="vertical" flexItem />}
      <div className={classes.card}>
        <div className={classes.cardContent}>
          <Typography variant={matches650 ? 'body2' : 'body1'} component="div" className={classes.title}>
            {`${totalLabel}${matches1000 ? ':' : ''}`}
          </Typography>
          <Typography variant={matches650 ? 'h6' : 'h5'} sx={{ fontWeight: '500' }}>
            {totalGenotypes === actualGenotypes ? (
              <>{totalGenotypes}</>
            ) : (
              <span className={classes.actualAndTotalValues}>
                {actualGenotypes}
                <Typography variant={matches650 ? 'body2' : 'body1'} sx={{ fontWeight: '500' }}>
                  /{totalGenotypes}
                </Typography>
              </span>
            )}
          </Typography>
        </div>
      </div>
    </div>
  );
};
