import React,{useState} from "react";
import "./RestaurantList.css";
import Addition from '../Addition/Addition';

const RestaurantList = () => {
    const [restaurantList, setRestaurantList] = useState([]);
  
    const addRestaurant = (newRestaurant) => {
      setRestaurantList((prevRestaurantList) => [...prevRestaurantList, newRestaurant]);
    };
  
    return (
      <div className="main-container">
        <h2>Restaurant Container</h2>
        <div className="restaurants-container">
          {restaurantList.map((restaurant, index) => (
            <div key={index} className="restaurant-item">
              <img src={restaurant.photo} alt="Restaurant" />
              <h3>{restaurant.name}</h3>
              <p>Rating: {restaurant.rating}</p>
            </div>
          ))}
        </div>
        <Addition addRestaurant={addRestaurant} />
      </div>
    );
  };

  export default RestaurantList;