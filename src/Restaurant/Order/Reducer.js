import {
    FETCH_ORDERS_REQUEST,
    FETCH_ORDERS_SUCCESS,
    FETCH_ORDERS_FAILURE,
  } from './Action';
  
  const initialState = {
    orders: [],
    loading: false,
    error: null,
  };
  
  const ordersReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_ORDERS_REQUEST:
        return {
          ...state,
          loading: true,
          error: null,
        };
      case FETCH_ORDERS_SUCCESS:
        return {
          ...state,
          loading: false,
          orders: action.payload,
        };
      case FETCH_ORDERS_FAILURE:
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default ordersReducer;
  