import { Card, CardContent, CardMedia, CircularProgress, Grid, Typography, useMediaQuery } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../../stores/hooks';
import { removeOrganism } from '../../stores/slices/dashboardSlice';
import { organismsCards } from '../../util/organismsCards';
import { MainLayout } from '../Layout';
import { useStyles } from './HomeMUI';

export const HomePage = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const matches600 = useMediaQuery('(max-width: 600px)');
  const { t, i18n } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [organismCounts, setOrganismCounts] = useState({});

  useEffect(() => {
    dispatch(removeOrganism());
    getOrganismsCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function getOrganismsCount() {
    setLoading(true);

    try {
      const response = await axios.get('/api/getCollectionCounts');
      setOrganismCounts(response.data);
    } catch (error) {
      console.log('error while getting collections count:', error);
    } finally {
      setLoading(false);
    }
  }

  const renderOrganismTitle = organism => {
    const translationKey = `home.organisms.${organism.value}`;

    if (i18n.exists(translationKey)) {
      return <Trans components={[<i key="italic" />]} i18nKey={translationKey} />;
    }

    return organism.label;
  };

  return (
    <MainLayout>
      <Card className={classes.card} style={{ padding: matches600 ? '0px 0px' : '' }}>
        <CardContent className={classes.organisms}>
          <Grid container>
            {organismsCards
              .filter(organism => !organism.disabled)
              .map(organism => (
                <Grid item xs={12} sm={4} md={3} key={organism.value} style={{ padding: matches600 ? '2px 16px' : '' }}>
                  <Link className={classes.organismLink} to={`/dashboard?organism=${organism.value}`} target="_blank">
                    <Card
                      className={`${classes.organismCard} ${matches600 ? classes.mobile : ''}`}
                      sx={{
                        position: 'relative',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        zIndex: 1,
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.2)',
                          zIndex: 2,
                        },
                      }}
                      elevation={matches600 ? 3 : 1}
                    >
                      <CardMedia
                        component="img"
                        alt={`${organism.stringLabel} image`}
                        height={matches600 ? 'auto' : '320px'}
                        style={{ width: matches600 ? '100px' : undefined }}
                        image={organism.img}
                      />

                      <div
                        className={classes.organismLegend}
                        style={{
                          position: matches600 ? '' : 'absolute',
                          backgroundColor: matches600 ? 'white' : 'rgba(0, 0, 0, 0.6)',
                          color: matches600 ? 'black' : 'white',
                        }}
                      >
                        <Typography fontWeight="600" sx={{ fontSize: 'small' }}>
                          {renderOrganismTitle(organism)}
                        </Typography>
                        <Typography sx={{ fontSize: 'smaller' }}>
                          {t('home.genomes')}:{' '}
                          {loading ? <CircularProgress size="1rem" /> : (organismCounts[organism.value] ?? 0)}
                        </Typography>
                      </div>
                    </Card>
                  </Link>
                </Grid>
              ))}
          </Grid>
        </CardContent>
      </Card>
      {/* <Footer /> */}
    </MainLayout>
  );
};
