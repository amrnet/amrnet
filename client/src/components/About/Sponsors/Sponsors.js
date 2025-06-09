import { useStyles } from '../AboutMUI';
import { Card, CardContent, Typography, CardMedia } from '@mui/material';
import { sponsorsCards } from './SponsorsCards';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

export const Sponsors = () => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        {/* <Typography variant="h5" className={classes.heading}>
          Sponsors
        </Typography>
        <Divider /> */}
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
          className={`${classes.carouselSwiper} sponsors-swiper`}
          style={{ marginTop: '0px' }}
        >
          {sponsorsCards.map((card) => {
            return (
              <SwiperSlide>
                <Card className={`${classes.swiperCard} sponsor-card`} elevation={2}>
                  <CardMedia
                    sx={{ height: 70, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', width: '100%' }}
                    image={card.img}
                  />
                  <CardContent className={classes.swiperCardContent}>
                    <Typography gutterBottom variant="h6" component="div">
                      {card.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
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
