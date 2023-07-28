import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from '../src/App/App';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Main from './User/Main';
import Restaurant from "./Restaurant/Restaurant";
import Delivery from "./Delivery/Delivery";
import Menu from "./Restaurant/Menu";
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import store from '../src/Restaurant/MenuRedux/Store'; 

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/main" component={Main} />
        <Route path="/restaurant" component={Restaurant}/>
        <Route path="/delivery" component={Delivery}/>
        <Route path="/menu" component={Menu}/>
      </Switch>
    </Router>
  </Provider>,
  document.getElementById('root')
);
reportWebVitals();
