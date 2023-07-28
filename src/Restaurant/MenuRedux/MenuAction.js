import axios from 'axios';

export const FETCH_MENU_REQUEST = 'FETCH_MENU_REQUEST';
export const FETCH_MENU_SUCCESS = 'FETCH_MENU_SUCCESS';
export const FETCH_MENU_FAILURE = 'FETCH_MENU_FAILURE';
export const SET_MENU = 'SET_MENU';
export const ADD_MENU_ITEM_SUCCESS = 'ADD_MENU_ITEM_SUCCESS';
export const ADD_MENU_ITEM_FAILURE = 'ADD_MENU_ITEM_FAILURE';
export const DELETE_MENU_ITEM_SUCCESS = 'DELETE_MENU_ITEM_SUCCESS';
export const DELETE_MENU_ITEM_FAILURE = 'DELETE_MENU_ITEM_FAILURE';

export const fetchMenuItems = (restaurant_id) => {
  return async (dispatch) => {
    try {
      dispatch({ type: FETCH_MENU_REQUEST });

      const response = await axios.get(`http://localhost:8002/menu/id/${restaurant_id}`);
      const menuDetails = response.data.menu;

      dispatch({
        type: FETCH_MENU_SUCCESS,
        payload: menuDetails,
      });
    } catch (error) {
      dispatch({ type: FETCH_MENU_FAILURE, payload: error.message });
    }
  };
};

export const setMenuDetails = (menuDetails) => {
  return {
    type: SET_MENU,
    payload: menuDetails,
  };
};

export const addMenuItem = (restaurant_id, newItem) => {
  return async (dispatch) => {
    try {
      await axios.post(`http://localhost:8002/menu/${restaurant_id}`, newItem);

      dispatch({
        type: ADD_MENU_ITEM_SUCCESS,
        payload: newItem,
      });
    } catch (error) {
      dispatch({ type: ADD_MENU_ITEM_FAILURE, payload: error.message });
    }
  };
};

export const deleteMenuItem = (restaurant_id, item_name) => {
  return async (dispatch) => {
    try {
      await axios.delete(`http://localhost:8002/menu/${restaurant_id}/${item_name}`);

      dispatch({
        type: DELETE_MENU_ITEM_SUCCESS,
        payload: item_name,
      });
    } catch (error) {
      dispatch({ type: DELETE_MENU_ITEM_FAILURE, payload: error.message });
    }
  };
};
