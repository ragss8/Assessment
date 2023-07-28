import {
    FETCH_RESTAURANT_DETAILS_REQUEST,
    FETCH_RESTAURANT_DETAILS_SUCCESS,
    FETCH_RESTAURANT_DETAILS_FAILURE,
  } from './Action';
  
  const initialState = {
    restaurantDetails: null,
    loading: false,
    error: null,
  };
  
  const restaurantReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_RESTAURANT_DETAILS_REQUEST:
        return { ...state, loading: true, error: null };
      case FETCH_RESTAURANT_DETAILS_SUCCESS:
        return { ...state, restaurantDetails: action.payload, loading: false, error: null };
      case FETCH_RESTAURANT_DETAILS_FAILURE:
        return { ...state, loading: false, error: action.payload };
      default:
        return state;
    }
  };
  
  export default restaurantReducer;
  