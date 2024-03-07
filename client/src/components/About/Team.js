import React, { useState } from 'react';
import { useStyles } from './AboutMUI';
import Carousel from 'react-simply-carousel';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { TeamCards } from './TeamCard';
import { GitHub } from '@mui/icons-material';
import { LinkedIn } from '@mui/icons-material';
// import TeamImgKH from '../../../src/assets/img/TeamImgKH.jpg';
// import TeamImgZD from '../../../src/assets/img/TeamImgZD.jpg';
// import TeamImgLC from '../../../src/assets/img/TeamImgLC.jpg';
// import TeamImgVS from '../../../src/assets/img/TeamImgVS.jpg';
// import TeamImgMC from '../../../src/assets/img/TeamImgMC.jpg';
// import TeamImgMM from '../../../src/assets/img/TeamImgMM.jpg';

//google scholar icon link
{/* <img width="24" height="24" src="https://img.icons8.com/material-outlined/24/google-scholar.png" alt="google-scholar"/> */}

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
                  <img
                    srcSet={`${member.img}?w=70&h=64&fit=crop&auto=format&dpr=1 1x`}
                    src={`${member.img}?w=70&h=64&fit=crop&auto=format`}
                    alt={member.title}
                    loading="lazy"
                  />
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
