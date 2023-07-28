import axios from 'axios';

export const FETCH_RESTAURANTS_REQUEST = 'FETCH_RESTAURANTS_REQUEST';
export const FETCH_RESTAURANTS_SUCCESS = 'FETCH_RESTAURANTS_SUCCESS';
export const FETCH_RESTAURANTS_FAILURE = 'FETCH_RESTAURANTS_FAILURE';
export const FETCH_MENU_REQUEST = 'FETCH_MENU_REQUEST';
export const FETCH_MENU_SUCCESS = 'FETCH_MENU_SUCCESS';
export const FETCH_MENU_FAILURE = 'FETCH_MENU_FAILURE';
export const FETCH_ORDER_SUCCESS = 'FETCH_ORDER_SUCCESS';
export const FETCH_ORDER_FAILURE = 'FETCH_ORDER_FAILURE';

export const fetchRestaurants = () => {
  return async (dispatch) => {
    try {
      dispatch({ type: FETCH_RESTAURANTS_REQUEST });

      const response = await axios.get('http://localhost:8002/restaurants');
      const restaurantList = response.data;

      dispatch({
        type: FETCH_RESTAURANTS_SUCCESS,
        payload: restaurantList,
      });
    } catch (error) {
      dispatch({ type: FETCH_RESTAURANTS_FAILURE, payload: error.message });
    }
  };
};

export const fetchMenuItems = (restaurantName) => {
  return async (dispatch) => {
    try {
      dispatch({ type: FETCH_MENU_REQUEST });

      const response = await axios.get(`http://localhost:8002/menu/name/${restaurantName}`);
      const menuItems = response.data.menu;

      dispatch({
        type: FETCH_MENU_SUCCESS,
        payload: menuItems,
      });
    } catch (error) {
      dispatch({ type: FETCH_MENU_FAILURE, payload: error.message });
    }
  };
};

export const fetchOrderDetails = (orderId) => {
  return async (dispatch) => {
    try {
      const response = await axios.get(`http://localhost:8002/orders/${orderId}`);
      const orderDetails = response.data;

      dispatch({ type: FETCH_ORDER_SUCCESS, payload: orderDetails });
    } catch (error) {
      dispatch({ type: FETCH_ORDER_FAILURE, payload: error.message });
    }
  };
};
