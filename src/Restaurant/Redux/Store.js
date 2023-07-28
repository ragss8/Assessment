import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import restaurantReducer from './Reducer';

const rootReducer = combineReducers({
  restaurant: restaurantReducer,
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;
