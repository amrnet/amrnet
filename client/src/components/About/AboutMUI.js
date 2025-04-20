import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  card: {
    '&.MuiCard-root': {
      borderRadius: '16px',
    },
  },
  cardContent: {
    margin: '0px 2%',
  },
  paragraph: {
    textAlign: 'justify',
  },
  paragraphBold: {
    fontWeight: '550',
  },
  heading: {
    // textAlign: 'center',
  },
  carouselSwiper: {
    marginTop: '16px',
    overflow: 'visible',

    '&:not(.sponsors-swiper) .swiper-wrapper': {
      paddingBottom: '32px',
    },

    '& .swiper-slide': {
      display: 'flex',
      height: 'auto',
    },

    '&.sponsors-swiper .swiper-wrapper': {
      '@media (max-width: 500px)': {
        paddingBottom: '32px',
      },
    },

    '& .swiper-button-next, & .swiper-button-prev': {
      color: '#6f2f9f',
    },

    '& .swiper-button-prev': {
      marginLeft: '-8px',

      '@media (max-width: 500px)': {
        display: 'none',
      },
    },

    '& .swiper-button-next': {
      marginRight: '-8px',

      '@media (max-width: 500px)': {
        display: 'none',
      },
    },
  },
  swiperCard: {
    margin: '8px 0px',
    height: '-webkit-fill-available',
    maxHeight: '230px',
    borderRadius: '16px !important',
    paddingTop: '20px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',

    '&.sponsor-card': {
      maxHeight: '210px',
    },
  },
  bulletActive: {
    backgroundColor: '#6f2f9f',
    opacity: 1,
  },
  swiperCardContent: {
    textAlign: 'center',
  },
}));

export { useStyles };
