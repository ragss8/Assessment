import { combineReducers } from 'redux';
import ordersReducer from './Reducer';

const rootReducer = combineReducers({
  orders: ordersReducer,
});

export default rootReducer;
