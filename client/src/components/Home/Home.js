import { CasinoOutlined } from '@mui/icons-material';
import { Card, CardContent, CardMedia, CircularProgress, Grid, Typography, useMediaQuery } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../../stores/hooks';
import { removeOrganism } from '../../stores/slices/dashboardSlice';
import { organismsCards } from '../../util/organismsCards';
import { paeruginosa } from '../../assets/organisms';
import { MainLayout } from '../Layout';
import { useStyles } from './HomeMUI';

// Vote-for-next-pathogen tile target. Set this to the team's Google Form / poll
// URL; while empty the tile renders but is non-clickable.
const NEXT_PATHOGEN_FORM_URL = 'https://forms.gle/BPw8JMzpvhQzs7Y98';

export const HomePage = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const matches600 = useMediaQuery('(max-width: 600px)');
  const { t, i18n } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [organismCounts, setOrganismCounts] = useState({});

  const visibleOrganisms = organismsCards.filter(organism => !organism.disabled);

  // "Surprise me!" → a random dashboard. Mirrors the organism cards' anchor
  // (new tab); re-rolls after each click so it varies.
  const randomDashboardHref = () => {
    if (visibleOrganisms.length === 0) return '/dashboard';
    const pick = visibleOrganisms[Math.floor(Math.random() * visibleOrganisms.length)];
    return `/dashboard?organism=${pick.value}`;
  };
  const [surpriseHref, setSurpriseHref] = useState(randomDashboardHref);

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
    const translationKey = `organisms.${organism.value}.name`;

    if (i18n.exists(translationKey)) {
      return <Trans i18nKey={translationKey} components={{ i: <i /> }} />;
    }

    return organism.label;
  };

  // Shared card body for an image tile (organism cards + the vote tile) so the
  // filler tiles are exactly the same size/style as the organism cards.
  const imageCardBody = (image, alt, titleNode, subtitleNode) => (
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
        alt={alt}
        height={matches600 ? 'auto' : '320px'}
        style={{ width: matches600 ? '100px' : undefined }}
        image={image}
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
          {titleNode}
        </Typography>
        <Typography sx={{ fontSize: 'smaller' }}>{subtitleNode}</Typography>
      </div>
    </Card>
  );

  return (
    <MainLayout>
      <Card className={classes.card} style={{ padding: matches600 ? '0px 0px' : '' }}>
        <CardContent className={classes.organisms}>
          <Grid container>
            {visibleOrganisms.map(organism => (
              <Grid item xs={12} sm={4} md={3} key={organism.value} style={{ padding: matches600 ? '2px 16px' : '' }}>
                <Link className={classes.organismLink} to={`/dashboard?organism=${organism.value}`} target="_blank">
                  {imageCardBody(
                    organism.img,
                    t(`organisms.${organism.value}.abbr`, organism.stringLabel),
                    renderOrganismTitle(organism),
                    <>
                      {t('home.genomes')}:{' '}
                      {loading ? <CircularProgress size="1rem" /> : (organismCounts[organism.value] ?? 0)}
                    </>,
                  )}
                </Link>
              </Grid>
            ))}

            {/* Surprise me! — same size as an organism card, no image, opens a random dashboard. */}
            <Grid item xs={12} sm={4} md={3} style={{ padding: matches600 ? '2px 16px' : '' }}>
              <a
                className={classes.organismLink}
                href={surpriseHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSurpriseHref(randomDashboardHref())}
              >
                <Card
                  className={`${classes.organismCard} ${matches600 ? classes.mobile : ''}`}
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    height: matches600 ? 'auto' : '320px',
                    minHeight: matches600 ? '72px' : undefined,
                    padding: 2,
                    backgroundColor: '#f6f6fa',
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
                  <div>
                    <CasinoOutlined sx={{ fontSize: matches600 ? 32 : 56, color: 'rgba(0, 0, 0, 0.45)' }} />
                    <Typography fontWeight="600" sx={{ fontSize: 'small', mt: 1 }}>
                      {t('home.placeholders.surprise', 'Surprise me!')}
                    </Typography>
                    <Typography sx={{ fontSize: 'smaller', color: 'rgba(0, 0, 0, 0.6)' }}>
                      {t('home.placeholders.surpriseSub', 'Open a random dashboard')}
                    </Typography>
                  </div>
                </Card>
              </a>
            </Grid>

            {/* What pathogen next? — P. aeruginosa background, organism-style label/legend, links to the vote form. */}
            <Grid item xs={12} sm={4} md={3} style={{ padding: matches600 ? '2px 16px' : '' }}>
              {NEXT_PATHOGEN_FORM_URL ? (
                <a className={classes.organismLink} href={NEXT_PATHOGEN_FORM_URL} target="_blank" rel="noopener noreferrer">
                  {imageCardBody(
                    paeruginosa,
                    'Pseudomonas aeruginosa',
                    t('home.placeholders.vote', 'What pathogen next?'),
                    t('home.placeholders.voteSub', 'Vote for the next organism'),
                  )}
                </a>
              ) : (
                imageCardBody(
                  paeruginosa,
                  'Pseudomonas aeruginosa',
                  t('home.placeholders.vote', 'What pathogen next?'),
                  t('home.placeholders.voteSub', 'Vote for the next organism'),
                )
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {/* <Footer /> */}
    </MainLayout>
  );
};
