import { useState } from 'react';
import { useStyles } from '../AboutMUI';
import Carousel from 'react-simply-carousel';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { teamCards } from './TeamCard';
// import MultiCarousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

export const Team = () => {
  const classes = useStyles();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <Typography variant="h6" className={classes.teamHeading}>
          Team
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
          {teamCards.map((member, index) => {
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
                  <a href={member.redirect} target="_blank" rel="noreferrer">
                    <img srcSet={`${member.img}`} src={`${member.img}`} alt={member.title} loading="lazy" />
                  </a>
                </Box>

                <Typography sx={{ marginTop: '10px' }}>{member.name}</Typography>
                <Typography sx={{ fontSize: '10px' }} className={classes.teamPost}>
                  {member.post}
                </Typography>
              </Typography>
            );
          })}
        </Carousel>
        {/* <MultiCarousel
          arrows
          centerMode={false}
          draggable
          infinite
          renderButtonGroupOutside={false}
          responsive={{
            desktop: {
              breakpoint: {
                max: 3000,
                min: 1024,
              },
              items: 3,
              partialVisibilityGutter: 40,
            },
            mobile: {
              breakpoint: {
                max: 464,
                min: 0,
              },
              items: 1,
              partialVisibilityGutter: 30,
            },
            tablet: {
              breakpoint: {
                max: 1024,
                min: 464,
              },
              items: 2,
              partialVisibilityGutter: 30,
            },
          }}
          rtl={false}
          showDots
          slidesToSlide={1}
          swipeable
        >
          {TeamCards.map((card) => {
            return <Card>{card.Name}</Card>;
          })}
        </MultiCarousel> */}
      </CardContent>
    </Card>
  );
};
