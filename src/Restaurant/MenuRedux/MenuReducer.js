import {
  FETCH_MENU_REQUEST,
  FETCH_MENU_SUCCESS,
  FETCH_MENU_FAILURE,
  DELETE_MENU_ITEM_SUCCESS,
  DELETE_MENU_ITEM_FAILURE,
  ADD_MENU_ITEM_SUCCESS,
  ADD_MENU_ITEM_FAILURE,
} from './MenuAction';

const initialState = {
  menuDetails: null,
  loading: false,
  error: null,
};

const menuReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_MENU_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_MENU_SUCCESS:
      return { ...state, menuDetails: action.payload, loading: false, error: null };
    case FETCH_MENU_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case DELETE_MENU_ITEM_SUCCESS:
      const updatedMenu = state.menuDetails.filter((item) => item.item_name !== action.payload);
      return { ...state, menuDetails: updatedMenu };
    case DELETE_MENU_ITEM_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case ADD_MENU_ITEM_SUCCESS:
      return { ...state, menuDetails: [...state.menuDetails, action.payload] };
    case ADD_MENU_ITEM_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default menuReducer;
