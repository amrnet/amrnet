import { Link } from 'react-router-dom';
import { useStyles } from './HomeMUI';
import { useAppDispatch } from '../../stores/hooks';
import { useEffect, useState } from 'react';
import { removeOrganism } from '../../stores/slices/dashboardSlice';
import { MainLayout } from '../Layout';
import { Card, CardContent, CardMedia, CircularProgress, Grid, Typography, useMediaQuery } from '@mui/material';
import { Footer } from '../Elements/Footer';
import { organismsCards } from '../../util/organismsCards';
import axios from 'axios';
import { API_ENDPOINT } from '../../constants';

export const HomePage = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const matches600 = useMediaQuery('(max-width: 600px)');

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
      const response = await axios.get(`${API_ENDPOINT}filters/getCollectionCounts`);
      setOrganismCounts(response.data);
    } catch (error) {
      console.log('error while getting collections count:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <MainLayout>
      <Card className={classes.card}>
        <CardContent className={classes.cardContent}>
          <Typography variant="body2" fontWeight="500" className={classes.legend}>
            AMRnet displays antimicrobial resistance data derived from genomic surveillance, for priority organisms. Click an organism below to view its data dashboard.
          </Typography>
        </CardContent>

        <CardContent className={classes.organisms}>
          <Grid container>
            {organismsCards.map((organism) => (
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
                      <Typography fontWeight="600" sx={{fontSize:"small"}}>{organism.label}</Typography>
                      <Typography sx={{fontSize:"smaller"}}>
                        Genomes: {loading ? <CircularProgress size="1rem" /> : organismCounts[organism.value] ?? 0}
                      </Typography>
                    </div>
                  </Card>
                </Link>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
      <Footer />
    </MainLayout>
  );
};
