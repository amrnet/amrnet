import { Card, CardContent, CardMedia, Divider, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useStyles } from '../AboutMUI';
import { useTeamCards } from './TeamCard';

export const Team = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const teamCards = useTeamCards();

  return (
    <Card className={classes.card} id="team-section">
      <CardContent className={classes.cardContent}>
        <Typography variant="h5" className={classes.heading}>
          {t('navigation.team')}
        </Typography>
        <Divider />
        <Swiper
          loop={true}
          slidesPerView={1}
          spaceBetween={15}
          pagination={{
            clickable: true,
            type: 'bullets',
            bulletActiveClass: classes.bulletActive,
          }}
          breakpoints={{
            550: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            800: {
              slidesPerView: 3,
              spaceBetween: 25,
            },
            1100: {
              slidesPerView: 4,
              spaceBetween: 30,
            },
          }}
          navigation={true}
          modules={[Pagination, Navigation]}
          className={classes.carouselSwiper}
        >
          {teamCards.map(card => {
            return (
              <SwiperSlide>
                <Card className={classes.swiperCard} elevation={2}>
                  <CardMedia
                    sx={{ height: 70, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', width: '100%' }}
                    image={card.img}
                  />
                  <CardContent className={classes.swiperCardContent}>
                    <Typography gutterBottom variant="button text" component="div" sx={{ fontWeight: '500' }}>
                      {card.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                      {card.post}
                    </Typography>
                  </CardContent>
                </Card>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </CardContent>
    </Card>
  );
};
