import { useState } from 'react';
import { useStyles } from '../AboutMUI';
import Carousel from 'react-simply-carousel';
import { Card, CardContent, Typography, Box } from '@mui/material';
// import MultiCarousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { sponsorsCards } from './SponsorsCards';

export const Sponsors = () => {
  const classes = useStyles();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <Typography variant="h6" className={classes.teamHeading}>
          Sponsors
        </Typography>
        <Carousel
          activeSlideIndex={activeSlideIndex}
          onRequestChange={setActiveSlideIndex}
          itemsToShow={4}
          itemsToScroll={1}
          forwardBtnProps={{ style: { display: 'none' } }}
          backwardBtnProps={{ style: { display: 'none' } }}
          dotsNav={{
            show: true,
            itemBtnProps: {
              style: {
                height: 16,
                width: 16,
                borderRadius: '50%',
                border: 0,
              },
            },
            activeItemBtnProps: {
              style: {
                height: 16,
                width: 16,
                borderRadius: '50%',
                border: 0,
                background: 'gray',
              },
            },
          }}
          speed={400}
        >
          {sponsorsCards.map((sponsor, index) => {
            return (
              <Typography className={classes.teamMember} key={`team-card-${index}`}>
                <Box
                  component="section"
                  height={70}
                  width={64}
                  display="flex"
                  alignItems="center"
                  gap={4}
                  p={1}
                  sx={{ border: '2px solid purple', margin: 'auto' }}
                >
                  <a href={sponsor.redirect} target="_blank" rel="noreferrer">
                    <img
                      width={64}
                      srcSet={`${sponsor.img}`}
                      src={`${sponsor.img}`}
                      alt={sponsor.title}
                      loading="lazy"
                    />
                  </a>
                </Box>

                <Typography sx={{ marginTop: '10px' }}>{sponsor.name}</Typography>
                <Typography sx={{ fontSize: '10px' }} className={classes.teamPost}>
                  {sponsor.post}
                </Typography>
              </Typography>
            );
          })}
        </Carousel>
      </CardContent>
    </Card>
  );
};
