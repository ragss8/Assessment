import axios from "axios";

export const FETCH_RESTAURANT_DETAILS_REQUEST = 'FETCH_RESTAURANT_DETAILS_REQUEST';
export const FETCH_RESTAURANT_DETAILS_SUCCESS = 'FETCH_RESTAURANT_DETAILS_SUCCESS';
export const FETCH_RESTAURANT_DETAILS_FAILURE = 'FETCH_RESTAURANT_DETAILS_FAILURE';
export const SET_RESTAURANT_DETAILS = 'SET_RESTAURANT_DETAILS';

export const fetchRestaurantDetails = (restaurant_id) => {
  return async (dispatch) => {
    try {
      dispatch({ type: FETCH_RESTAURANT_DETAILS_REQUEST });

      const response = await axios.get(`http://localhost:8002/restaurant/${restaurant_id}`);
      const restaurantDetails = response.data;

      dispatch({
        type: FETCH_RESTAURANT_DETAILS_SUCCESS,
        payload: restaurantDetails,
      });
    } catch (error) {
      dispatch({ type: FETCH_RESTAURANT_DETAILS_FAILURE, payload: error.message });
    }
  };
};

export const setRestaurantDetails = (restaurantDetails) => {
  return {
    type: SET_RESTAURANT_DETAILS,
    payload: restaurantDetails,
  };
};
