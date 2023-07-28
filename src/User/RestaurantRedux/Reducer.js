import {
  FETCH_RESTAURANTS_REQUEST,
  FETCH_RESTAURANTS_SUCCESS,
  FETCH_RESTAURANTS_FAILURE,
  FETCH_MENU_REQUEST,
  FETCH_MENU_SUCCESS,
  FETCH_MENU_FAILURE,
  FETCH_ORDER_SUCCESS,
  FETCH_ORDER_FAILURE,
} from './Action';

const initialState = {
  restaurants: [],
  menuItems: [],
  orderDetails: null,
  loading: false,
  error: null,
};

const restaurantReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_RESTAURANTS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_RESTAURANTS_SUCCESS:
      return { ...state, restaurants: action.payload, loading: false, error: null };
    case FETCH_RESTAURANTS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case FETCH_MENU_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_MENU_SUCCESS:
      return { ...state, menuItems: action.payload, loading: false, error: null };
    case FETCH_MENU_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case FETCH_ORDER_SUCCESS: 
      return { ...state, orderDetails: action.payload, loading: false, error: null };
    case FETCH_ORDER_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default restaurantReducer;
