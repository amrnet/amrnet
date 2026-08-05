import { Card, CardContent, CardMedia, CircularProgress, Grid, SvgIcon, Typography, useMediaQuery } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../../stores/hooks';
import { removeOrganism } from '../../stores/slices/dashboardSlice';
import { organismsCards } from '../../util/organismsCards';
import { isProduction } from '../../util/env';
import { paeruginosa } from '../../assets/organisms';
import { MainLayout } from '../Layout';
import { useStyles } from './HomeMUI';

// Vote-for-next-pathogen tile target. Set this to the team's Google Form / poll
// URL; while empty the tile renders but is non-clickable.
const NEXT_PATHOGEN_FORM_URL = 'https://forms.gle/BPw8JMzpvhQzs7Y98';

// DNA double-helix icon (MUI has no DNA glyph), drawn as two crossing strands
// with connecting rungs. Uses currentColor so `sx={{ color }}` applies.
const DnaIcon = props => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2c0 5 8 5 8 10s-8 5-8 10" />
      <path d="M16 2c0 5-8 5-8 10s8 5 8 10" />
      <path d="M8.6 5h6.8M7.2 9h9.6M7.2 15h9.6M8.6 19h6.8" />
    </g>
  </SvgIcon>
);

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

            {/* Filler tiles (Surprise me! / next-pathogen vote) are dev-only for now:
                per the review the new landing must not go live until Staph & Strep are
                public. In production the grid shows only the organism cards. */}
            {!isProduction() && (
              <>
            {/* Surprise me! — same size/style as an organism card (dark media +
                bottom legend), opens a random active dashboard. Uses <Link> so the
                HashRouter URL (#/dashboard?organism=…) is generated correctly. */}
            <Grid item xs={12} sm={4} md={3} style={{ padding: matches600 ? '2px 16px' : '' }}>
              <Link
                className={classes.organismLink}
                to={surpriseHref}
                target="_blank"
                onClick={() => setSurpriseHref(randomDashboardHref())}
              >
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
                  <div
                    style={{
                      height: matches600 ? 'auto' : '320px',
                      minHeight: matches600 ? '72px' : undefined,
                      width: matches600 ? '100px' : '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #1b1b2f 0%, #0f3460 100%)',
                    }}
                  >
                    <DnaIcon sx={{ fontSize: matches600 ? 40 : 80, color: '#ffffff' }} />
                  </div>
                  <div
                    className={classes.organismLegend}
                    style={{
                      position: matches600 ? '' : 'absolute',
                      backgroundColor: matches600 ? 'white' : 'rgba(0, 0, 0, 0.6)',
                      color: matches600 ? 'black' : 'white',
                    }}
                  >
                    <Typography fontWeight="600" sx={{ fontSize: 'small' }}>
                      {t('home.placeholders.surprise', 'Surprise me!')}
                    </Typography>
                    <Typography sx={{ fontSize: 'smaller' }}>
                      {t('home.placeholders.surpriseSub', 'Open a random dashboard')}
                    </Typography>
                  </div>
                </Card>
              </Link>
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
              </>
            )}
          </Grid>
        </CardContent>
      </Card>
      {/* <Footer /> */}
    </MainLayout>
  );
};
