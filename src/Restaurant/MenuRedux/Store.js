import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import menuReducer from './MenuReducer';

const rootReducer = combineReducers({
    menu: menuReducer,
});

const Store = createStore(rootReducer,applyMiddleware(thunk));

export default Store;
