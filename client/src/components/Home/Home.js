import { BiotechOutlined, CasinoOutlined, HowToVoteOutlined } from '@mui/icons-material';
import { Card, CardContent, CardMedia, CircularProgress, Grid, Typography, useMediaQuery } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../../stores/hooks';
import { removeOrganism } from '../../stores/slices/dashboardSlice';
import { organismsCards } from '../../util/organismsCards';
import { abaumannii, paeruginosa, vibriocholerae } from '../../assets/organisms';
import { MainLayout } from '../Layout';
import { useStyles } from './HomeMUI';

// Vote-for-next-pathogen tile target. Set this to the team's Google Form / poll
// URL; while empty the tile renders but is non-clickable.
const NEXT_PATHOGEN_FORM_URL = '';

// Placeholder/filler tiles that replace the blank whitespace left in the last
// grid row. `surprise` opens a randomly chosen dashboard; `vote` links to the
// next-pathogen poll; `image` is a purely decorative bacteria tile.
function PlaceholderTile({ tile, classes, matches600 }) {
  // Decorative candidate-pathogen tile — looks like an organism card (image +
  // caption) but is not clickable. Images are public domain (CDC PHIL / Dartmouth).
  if (tile.kind === 'candidate') {
    return (
      <Card
        className={`${classes.organismCard} ${matches600 ? classes.mobile : ''}`}
        sx={{ position: 'relative', cursor: 'default', filter: 'grayscale(0.15)' }}
        elevation={matches600 ? 3 : 1}
      >
        <CardMedia
          component="img"
          alt={tile.alt}
          height={matches600 ? 'auto' : '320px'}
          style={{ width: matches600 ? '100px' : undefined }}
          image={tile.img}
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
            {tile.title}
          </Typography>
          {tile.subtitle && <Typography sx={{ fontSize: 'smaller' }}>{tile.subtitle}</Typography>}
        </div>
      </Card>
    );
  }

  const clickable = tile.kind !== 'image' && !!tile.onClick;
  const inner = (
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
        border: '2px dashed',
        borderColor: 'rgba(0, 0, 0, 0.18)',
        backgroundColor: '#f6f6fa',
        color: 'rgba(0, 0, 0, 0.7)',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': clickable
          ? { transform: 'scale(1.05)', boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.2)' }
          : {},
      }}
      elevation={0}
    >
      <div>
        {tile.icon}
        <Typography fontWeight="600" sx={{ fontSize: 'small', mt: 1 }}>
          {tile.title}
        </Typography>
        {tile.subtitle && (
          <Typography sx={{ fontSize: 'smaller', color: 'rgba(0, 0, 0, 0.55)' }}>{tile.subtitle}</Typography>
        )}
      </div>
    </Card>
  );

  if (tile.kind === 'vote' && tile.href) {
    return (
      <a className={classes.organismLink} href={tile.href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  if (clickable) {
    return (
      <div className={classes.organismLink} role="button" tabIndex={0} onClick={tile.onClick}>
        {inner}
      </div>
    );
  }
  return inner;
}

export const HomePage = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const matches600 = useMediaQuery('(max-width: 600px)');
  // Grid columns mirror the <Grid item> breakpoints below (md=3→4 cols,
  // sm=4→3 cols, xs=12→1 col) so we can fill the trailing blank cells.
  const isMdUp = useMediaQuery('(min-width: 900px)');
  const isSmUp = useMediaQuery('(min-width: 600px)');
  const columns = isMdUp ? 4 : isSmUp ? 3 : 1;
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
    const translationKey = `organisms.${organism.value}.name`;

    if (i18n.exists(translationKey)) {
      return <Trans i18nKey={translationKey} components={{ i: <i /> }} />;
    }

    return organism.label;
  };

  const visibleOrganisms = organismsCards.filter(organism => !organism.disabled);

  const openRandomDashboard = () => {
    if (visibleOrganisms.length === 0) return;
    const pick = visibleOrganisms[Math.floor(Math.random() * visibleOrganisms.length)];
    window.open(`/dashboard?organism=${pick.value}`, '_blank', 'noopener');
  };

  const iconSx = { fontSize: matches600 ? 32 : 56, color: 'rgba(0, 0, 0, 0.45)' };

  // The chosen filler tiles, in priority order.
  const specialTiles = [
    {
      key: 'surprise',
      kind: 'surprise',
      icon: <CasinoOutlined sx={iconSx} />,
      title: t('home.placeholders.surprise', 'Surprise me!'),
      subtitle: t('home.placeholders.surpriseSub', 'Open a random dashboard'),
      onClick: openRandomDashboard,
    },
    {
      key: 'vote',
      kind: 'vote',
      icon: <HowToVoteOutlined sx={iconSx} />,
      title: t('home.placeholders.vote', 'What pathogen next?'),
      subtitle: t('home.placeholders.voteSub', 'Vote for the next organism'),
      href: NEXT_PATHOGEN_FORM_URL,
    },
    {
      key: 'cand-abaumannii',
      kind: 'candidate',
      img: abaumannii,
      alt: 'Acinetobacter baumannii',
      title: <i>Acinetobacter baumannii</i>,
      subtitle: t('home.placeholders.candidate', 'Candidate — vote above'),
    },
    {
      key: 'cand-paeruginosa',
      kind: 'candidate',
      img: paeruginosa,
      alt: 'Pseudomonas aeruginosa',
      title: <i>Pseudomonas aeruginosa</i>,
      subtitle: t('home.placeholders.candidate', 'Candidate — vote above'),
    },
    {
      key: 'cand-vibriocholerae',
      kind: 'candidate',
      img: vibriocholerae,
      alt: 'Vibrio cholerae',
      title: <i>Vibrio cholerae</i>,
      subtitle: t('home.placeholders.candidate', 'Candidate — vote above'),
    },
  ];

  // Pad with extra decorative tiles so the last row never ends in blank cells.
  const totalBeforePad = visibleOrganisms.length + specialTiles.length;
  const emptyCount = (columns - (totalBeforePad % columns)) % columns;
  const padTiles = Array.from({ length: emptyCount }, (_, i) => ({
    key: `pad-${i}`,
    kind: 'image',
    icon: <BiotechOutlined sx={iconSx} />,
    title: t('home.placeholders.more', 'More organisms coming soon'),
  }));
  const placeholderTiles = [...specialTiles, ...padTiles];

  return (
    <MainLayout>
      <Card className={classes.card} style={{ padding: matches600 ? '0px 0px' : '' }}>
        <CardContent className={classes.organisms}>
          <Grid container>
            {visibleOrganisms.map(organism => (
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
                      alt={t(`organisms.${organism.value}.abbr`, organism.stringLabel)}
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

            {placeholderTiles.map(tile => (
              <Grid item xs={12} sm={4} md={3} key={tile.key} style={{ padding: matches600 ? '2px 16px' : '' }}>
                <PlaceholderTile tile={tile} classes={classes} matches600={matches600} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
      {/* <Footer /> */}
    </MainLayout>
  );
};
