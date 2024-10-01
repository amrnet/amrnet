import { Header } from "../Header"
import { MainLayout } from '../../Layout';
import React, { useState } from 'react';
import { useStyles } from './landingPageMUI';
import Carousel from 'react-simply-carousel';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { orgCard } from '../../../util/orgCard';
import { setOrganism, setGlobalOverviewLabel, setTotalGenomes} from '../../../stores/slices/dashboardSlice';
import { useAppDispatch, useAppSelector } from '../../../stores/hooks';
import { red } from "@mui/material/colors";
import {DashboardPage} from '../../Dashboard';
import { useLocation, useNavigate } from 'react-router-dom';
import {Footer} from '../Footer'


export const LandingPage = () =>{
    const navigate = useNavigate();
    const classes = useStyles();
    const dispatch = useAppDispatch();
    const organism = useAppSelector((state) => state.dashboard.organism);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const totalGenomes = useAppSelector((state) => state.dashboard.totalGenomes);

    
    const names = (value, name) => {
      const labels = name.split(' ');
      if (['ngono', 'ecoli', 'senterica', 'kpneumo'].includes(value)) {
        return <i>{labels[0]} {labels[1]} {labels[2]}</i>;
      }else if (value === ('decoli')) {
        return <> {labels[0]} <i>{labels[1]} {labels[2]} </i></>;
      } else if (value === ('sentericaints')) {
        return <> {labels[0]} {labels[1]} <i> {labels[2]} </i></>;
      } else{
        return <> <i>{labels[0]}</i> {labels[1]} {labels[2]}</>;
      }
    };

    const handleClick = (name) => {
        dispatch(setOrganism(name));
        const currentOrganism = orgCard.find((x) => x.value === name);
        console.log("currentOrganism", currentOrganism);
        const labels = currentOrganism.label.split(' ');
        dispatch(
      setGlobalOverviewLabel({
        label0: labels[0],
        label1: labels[1],
        label2: labels[2],
        fullLabel: currentOrganism.label
        
      })
    );
        // return(
            navigate('/DashboardPage')
            console.log("organism", name, organism);

            // window.open(`#/DashboardPage`, '_blank');
        // )
       
        // handleGlobalOverviewLabel(name);
    };

    return (
    <MainLayout  isLandingPage>
     
        <Card className={classes.card}>
            <CardContent className={classes.cardContent}>
              <div className={classes.teamMember} >
                {orgCard.map((member, index) => {
                return (
                  <div className={classes.overlay} onClick={() => handleClick(member.value)}>
                    <div className={classes.teamMemberDiv} key={`team-card-${index}`}  >
                        <img
                            src={`${member.img}`}
                            alt={member.title}
                            loading="lazy"
                            className={classes.teamMemberImg}
                        />   
                    </div>
                    <div className={classes.typographyWrapper}>
                        <Typography className={classes.typography}>
                            {names(member.value, member.label)}
                        </Typography>
                    </div>
                </div>

                )
                })}
              </div>
            </CardContent>
        </Card>
      <Footer />
    </MainLayout>
  );
}
