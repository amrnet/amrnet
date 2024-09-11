import React, { useState } from 'react';
import { useStyles } from './AboutMUI';
import Carousel from 'react-simply-carousel';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { TeamCards } from './TeamCard';

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
          {TeamCards.map((member, index) => {
            return (
              <Typography className={classes.teamMember} key={`team-card-${index}`}>
                <Box
                  component="section"
                  height={70}
                  width={64}
                  // my={4}
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

                <Typography sx={{ marginTop: '10px' }}>{member.Name}</Typography>
                <Typography sx={{ fontSize: '10px' }} className={classes.teamPost}>
                  {member.Post}
                </Typography>
              </Typography>
            );
          })}
        </Carousel>
      </CardContent>
    </Card>
  );
};
