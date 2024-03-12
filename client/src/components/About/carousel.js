import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearErrors, getProductDetails, newReview } from '../../actions/productAction';
import { MdOutlineReviews } from 'react-icons/md';
import ReviewCard from './ReviewCard.js';
import Loader from '../layout/Loader';
import Metadata from '../layout/Metadata';
import { addItemsToCart } from '../../actions/cartAction';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@material-ui/core';
import { Rating } from '@material-ui/lab';
import { NEW_REVIEW_RESET } from '../../constants/productConstants';
import { toast } from 'react-toastify';

import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { myOrders } from '../../actions/orderAction';

export default function ProductDetails() {
  const params = useParams();

  const navigate = useNavigate();

  const { product, loading, error } = useSelector((state) => state.productDetails);

  const { success, error: reviewError } = useSelector((state) => state.newReview);

  const { isAuthenticated } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  // Add More Statics to Review section // start
  const { orders } = useSelector((state) => state.myOrders);

  let purchaseIds =
    orders &&
    orders.map((ele) => {
      return ele.orderItems.map((item) => {
        return item.product;
      });
    });

  let verified = purchaseIds && purchaseIds.filter((ele) => String(ele) === product._id);

  const isVarified = String(verified) === product._id;

  // Add More Statics to Review section // Complete

  const options = {
    size: 'large',
    value: product.ratings,
    readOnly: true,
    precision: 0.5,
  };

  const [quantity, setQuantity] = useState(1);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    quantity > 1 ? setQuantity(quantity - 1) : setQuantity(1);
  };

  const submitReviewToggle = () => {
    if (isAuthenticated === false) {
      navigate('/login');
    } else {
      open ? setOpen(false) : setOpen(true);
    }
  };

  const addToCartHandler = () => {
    dispatch(addItemsToCart(params.id, quantity));
    toast.success('Item Added To Cart', {
      position: 'top-center',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'colored',
    });
  };

  const reviewSubmitHandler = () => {
    const myForm = new FormData();
    myForm.set('rating', rating);
    myForm.set('comment', comment);
    myForm.set('productId', params.id);

    dispatch(newReview(myForm));
    toast.success('Review submitted', {
      position: 'top-center',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'colored',
    });
    setOpen(false);
  };

  const responsive = {
    superLargeDesktop: {
      // the naming can be any, depends on you.
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 2,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (error) {
      //   alert.error(error);
      dispatch(clearErrors());
    }

    if (reviewError) {
      //   alert.error(reviewError);
      dispatch(clearErrors());
    }

    if (success) {
      //   alert.success("Review Submitted Successfully");
      dispatch({ type: NEW_REVIEW_RESET });
    }
    dispatch(getProductDetails(params.id));
    dispatch(myOrders());
  }, [dispatch, params.id, error, reviewError, success]);

  return (
    <>
      {product && (
        <div>
          {loading ? (
            <Loader />
          ) : (
            <div>
              <div className="md:mx-auto  lg:w-[70%] xl:w-[50%]">
                <Carousel
                  responsive={responsive}
                  swipeable={true}
                  draggable={false}
                  showDots={true}
                  ssr={true} // means to render carousel on server-side.
                  infinite={true}
                  autoPlaySpeed={1000}
                  keyBoardControl={true}
                  customTransition="all .5"
                  transitionDuration={500}
                  containerClass="carousel-container"
                  removeArrowOnDeviceType={['tablet', '']}
                  dotListClass="custom-dot-list-style"
                  itemClass="carousel-item-padding-40-px"
                >
                  {product.images &&
                    product.images.map((element, index) => {
                      return <img className="h-[100%]" key={index} src={element.url} alt="" />;
                    })}
                </Carousel>
              </div>
              <Metadata title={`SmartBuyer - ${product.name} details`} />
              <section className=" primaryFont overflow-hidden">
                <div className="container px-5 md:py-10 mx-auto">
                  <div className="lg:w-4/5 mx-auto flex flex-wrap md:justify-center md:items-center">
                    <div className="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0 lg:mx-5">
                      <h2 className="text-sm title-font text-gray-500 tracking-widest">{product.category}</h2>
                      <h1 className=" text-2xl lg:text-3xl title-font font-medium mb-1">{product.name}</h1>
                      <div className="flex mb-4">
                        <span className="flex items-center">
                          <div>
                            {' '}
                            <Rating {...options} />
                          </div>
                        </span>
                        <span className="flex ml-3 pl-3 py-2 border-l-2 border-gray-800 text-gray-500 space-x-2">
                          <div>
                            <svg
                              fill="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              className="w-5 h-5"
                              viewBox="0 0 24 24"
                            >
                              <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
                            </svg>
                          </div>
                          <div>
                            <svg
                              fill="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              className="w-5 h-5"
                              viewBox="0 0 24 24"
                            >
                              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                            </svg>
                          </div>
                          <div>
                            <svg
                              fill="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              className="w-5 h-5"
                              viewBox="0 0 24 24"
                            >
                              <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"></path>
                            </svg>
                          </div>
                        </span>
                      </div>
                      <p className="leading-relaxed text-xs">
                        {' '}
                        <span className=" font-semibold">Id</span> : {product._id}
                      </p>
                      <p className="text-sm lg:text-base my-3">
                        <span className=" font-semibold ">Description</span> :{product.description}
                      </p>
                      <div className="flex flex-col justify-start mt-6 items-start pb-5 border-b-2 border-gray-800 mb-5 space-y-3">
                        <div className="flex">
                          <span className="">
                            {' '}
                            <span className="text-base font-semibold">Stock left :</span> {product.stock}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="  text-green-500 font-semibold">
                            {' '}
                            {product.price &&
                              product.price.toLocaleString('en-IN', {
                                style: 'currency',
                                currency: 'INR',
                              })}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-3">
                            <span className="text-base font-semibold">Quantity</span>
                          </span>
                          <div className="">
                            <button
                              onClick={decreaseQuantity}
                              className="px-3 py2 bg-blue-500  mx-2 rounded-md text-white"
                            >
                              -
                            </button>
                            <span className="text-base font-semibold">{quantity}</span>
                            <button
                              onClick={increaseQuantity}
                              disabled={product.stock - 1 < quantity}
                              className="px-3 py2 bg-blue-500  text-white mx-2 rounded-md"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center my-3 space-x-2">
                        <span className="text-base font-semibold ">Status :</span>
                        <p className={product.stock < 5 ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}>
                          {product.stock < 1 ? 'Out Of Stock' : 'Instock'}
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-center items-start space-x-2">
                        <Link to="/cart">
                          <button
                            className="flex ml-auto  bg-blue-500 text-white border-0 py-2 px-6 focus:outline-none hover:bg-blue-800 hover:scale-105 ease-in-out duration-300 rounded font-semibold text-xs lg:text-base"
                            onClick={addToCartHandler}
                          >
                            Add To Cart
                          </button>
                        </Link>

                        {/* <button className="hover:scale-105 hover:text-red-500 ease-in-out duration-300  rounded-full w-10 h-10 bg-gray-800 p-0 border-0 inline-flex items-center justify-center text-white ml-4">
                                                      <svg fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
                                                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path>
                                                      </svg>
                                                </button> */}
                        {isVarified && (
                          <button
                            className="flex bg-blue-500 text-white border-0 py-2 px-6 focus:outline-none hover:bg-blue-800 hover:scale-105 ease-in-out duration-300 rounded font-semibold text-xs lg:text-base"
                            onClick={submitReviewToggle}
                          >
                            Add Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="h-[1px] bg-gray-700 w-[90vw] m-auto my-5"></div>

                  <Dialog aria-labelledby="simple-dialog-title" open={open} onClose={submitReviewToggle}>
                    <DialogTitle>Add Review</DialogTitle>
                    <DialogContent className="submitDialog">
                      <Rating onChange={(e) => setRating(e.target.value)} value={rating} size="large" />

                      <textarea
                        className="submitDialogTextArea"
                        cols="30"
                        rows="5"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      ></textarea>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={submitReviewToggle} color="secondary">
                        Cancel
                      </Button>
                      <Button onClick={reviewSubmitHandler} color="primary">
                        Submit
                      </Button>
                    </DialogActions>
                  </Dialog>
                  <div className="text-center my-5 font-semibold">
                    <span className="text-xl">Reviews</span>{' '}
                    <span className="text-blue-500">({product.numOfReviews})</span>
                  </div>
                  {product.reviews && product.reviews[0] ? (
                    <div className="md:flex md:flex-col">
                      {product.reviews &&
                        product.reviews.map((element, index) => (
                          <ReviewCard review={element} allReviews={product.reviews} key={index} product={product} />
                        ))}
                    </div>
                  ) : (
                    <div>
                      <p className="flex items-center text-xl justify-center my-10 text-blue-500">
                        No Reviews yet. Be the first one to Review...
                        <MdOutlineReviews />
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      )}
    </>
  );
}
