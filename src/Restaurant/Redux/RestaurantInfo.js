import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import RestaurantContainer from './RestaurantContainer';
import store from './Store';
import { fetchRestaurantDetails } from './Action';
import './RestaurantCont.css';

const RestaurantInfo = () => {
  const [restaurant_id, setRestaurant_id] = useState('');

  useEffect(() => {
    const storedRestaurant_id = localStorage.getItem('restaurant_id');
    if (storedRestaurant_id) {
      setRestaurant_id(storedRestaurant_id);
      store.dispatch(fetchRestaurantDetails(storedRestaurant_id));
    }
  }, []);

  const handleIdChange = (event) => {
    const newId = event.target.value;
    setRestaurant_id(newId);
    localStorage.setItem('restaurant_id', newId);
    store.dispatch(fetchRestaurantDetails(newId));
  };

  return (
    <Provider store={store}>
      <div className="app-container">
        <h1 className="app-title">Restaurant Details</h1>
        <form>
          <label className="email-label">
            Enter ID for info:
            <input
              className="email-input"
              type="text"
              value={restaurant_id}
              onChange={handleIdChange}
              required
            />
          </label>
        </form>
        <div className='clickable'>
        <RestaurantContainer />
        </div>
      </div>
    </Provider>
  );
};

export default RestaurantInfo;
