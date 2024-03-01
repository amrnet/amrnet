import React, { useState } from "react";
import { useStyles } from './AboutMUI';
import Carousel from "react-simply-carousel";
import { Card, CardContent, Typography } from '@mui/material';
import { TeamCards } from "./TeamCard";


export const Team = () => {
    const classes = useStyles();
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    

  return (
    <Card className={classes.card}>
        <CardContent className={classes.cardContent}>
            <Typography variant="h6" className={classes.teamHeading}>AMRnet Team</Typography>
            <Carousel
                activeSlideIndex={activeSlideIndex}
                onRequestChange={setActiveSlideIndex}
                itemsToShow={4}
                itemsToScroll={1}
                forwardBtnProps={{style:{display:"none"}}}
                backwardBtnProps={{style:{display:"none"}}}
                dotsNav={{
                    show: true,
                    itemBtnProps: {
                        style: {
                        height: 16,
                        width: 16,
                        borderRadius: "50%",
                        border: 0
                        }
                    },
                    activeItemBtnProps: {
                        style: {
                        height: 16,
                        width: 16,
                        borderRadius: "50%",
                        border: 0,
                        background: "gray"
                        }
                    }
                    }}
                speed={400}
            >
                {TeamCards.map((member, index)=>{
                    return(
                    <div className={classes.teamMember} key={`team-card-${index}`}>
                        {member.Name}
                    </div>)
                })}
            </Carousel>
        </CardContent>
    </Card>
  );
}
