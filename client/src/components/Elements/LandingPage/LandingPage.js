import { Header } from "../Header"
import { MainLayout } from '../../Layout';
import React, { useState } from 'react';
import { useStyles } from './landingPageMUI';
import Carousel from 'react-simply-carousel';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { orgCard } from '../../../util/orgCard';
import { setOrganism, setGlobalOverviewLabel} from '../../../stores/slices/dashboardSlice';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { red } from "@mui/material/colors";
import {DashboardPage} from '../../Dashboard';
import { useLocation, useNavigate } from 'react-router-dom';


const organisms = [
  {
    label: 'Salmonella Typhi',
    value: 'styphi',
    abbr: 'S. Typhi',
  },
  {
    label: 'Klebsiella pneumoniae',
    value: 'kpneumo',
    abbr: 'K. pneumoniae',
  },
  {
    label: 'Neisseria gonorrhoeae',
    value: 'ngono',
    abbr: 'N. gonorrhoeae',
  },
  // {
  //   label: 'Escherichia coli',
  //   value: 'ecoli',
  //   abbr: 'E. coli'
  // },
  {
    label: 'Diarrheagenic E. coli',
    value: 'decoli',
    abbr: 'DEC',
  },
  {
    label: 'Shigella + EIEC',
    value: 'shige',
    abbr: 'Shigella+EIEC',
  },
  {
    label: 'Invasive non-typhoidal Salmonella',
    value: 'sentericaints',
    abbr: 'iNTS',
  },
  // {
  //   label: 'Salmonella enterica',
  //   value: 'senterica',
  //   abbr: 'S. enterica'
  // }
];


export const LandingPage = () =>{
    const navigate = useNavigate();
    const classes = useStyles();
    const dispatch = useAppDispatch();
    const organism = useAppSelector((state) => state.dashboard.organism);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);


    const handleClick = (name) => {
        dispatch(setOrganism(name));
        return(
            navigate('/DashboardPage')
        )
       
        // handleGlobalOverviewLabel(name);
    };

    return (
    <MainLayout isHomePage>
     
        <Card className={classes.card}>
            <CardContent className={classes.cardContent}>
            <Typography variant="h6" className={classes.teamHeading}>Organism</Typography>
            <Carousel
                activeSlideIndex={activeSlideIndex}
                onRequestChange={setActiveSlideIndex}
                itemsToShow={4}
                itemsToScroll={1}
                onChange={handleClick}
                forwardBtnProps={{ style: { display: "none" } }}
                backwardBtnProps={{ style: { display: "none" } }}
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
                {orgCard.map((member, index) => {
                return (
                    <div className={classes.teamMember} key={`team-card-${index}`} onClick={() => handleClick(member.value)} >
                        <Typography sx={{ marginTop: "10px" }}>
                            {member.label}
                        </Typography>
                    </div>
                )
                })}
            </Carousel>
            </CardContent>
        </Card>
     
    </MainLayout>
  );
}