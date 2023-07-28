import React from 'react';
import { useHistory } from 'react-router-dom';

const RestaurantItem = ({ restaurant }) => {
  const history = useHistory();

  const handleRestaurantClick = (restaurantName) => {
    history.push(`/menupage?restaurant=${encodeURIComponent(restaurantName)}`);
  };
  
  return (
    <li key={restaurant.restaurantName} className='rest-li' onClick={handleRestaurantClick}>
      <strong>{restaurant.restaurantName}</strong>
      <div className="restaurant-details">
        <div>{restaurant.address}</div>
        <div>Cuisine Type: {restaurant.cuisineType}</div>
        <div>Delivery Time: {restaurant.deliveryTime}</div>
        <div>Average Rating: {restaurant.averageRating}</div>
      </div>
    </li>
  );
};

export default RestaurantItem;
