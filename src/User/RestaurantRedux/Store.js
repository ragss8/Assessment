import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import restaurantReducer from '../RestaurantRedux/Reducer';

const rootReducer = combineReducers({
  restaurant: restaurantReducer,
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;
