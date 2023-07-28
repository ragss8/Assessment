import React, { useState } from 'react';
import "./Sidebar.css";

const Sidebar = () => {
    const [showCuisineList, setShowCuisineList] = useState(false);
    const [showDietaryList, setShowDietaryList] = useState(false);
    const [showDeliveryTimeList, setShowDeliveryTimeList] = useState(false);
    const [showRatingsList, setShowRatingsList] = useState(false);
    const [showLocationList, setShowLocationList] = useState(false);
    const [specificArea, setSpecificArea] = useState('');
  
    const handleToggleCuisineList = () => {
      setShowCuisineList(!showCuisineList);
    };
  
    const handleToggleDietaryList = () => {
      setShowDietaryList(!showDietaryList);
    };
  
    const handleToggleDeliveryTimeList = () => {
      setShowDeliveryTimeList(!showDeliveryTimeList);
    };
  
    const handleToggleRatingsList = () => {
      setShowRatingsList(!showRatingsList);
    };
  
    const handleToggleLocationList = () => {
      setShowLocationList(!showLocationList);
    };
    
    const handleSpecificAreaChange = (event) => {
      setSpecificArea(event.target.value);
    };
  
    return (
      <div className="sidebar">
        <h3>Content</h3>
        <div>
          <button className="filter-button" onClick={handleToggleCuisineList}>Cuisine Type</button>
          {showCuisineList && (
            <ul>
              <li><input type="checkbox" /> Chinese</li>
              <li><input type="checkbox" />  Italian</li>
              <li><input type="checkbox" /> Mexican</li>
              <li><input type="checkbox" /> Indian</li>
            </ul>
          )}
        </div>
  
        <div>
          <button  className="filter-button" onClick={handleToggleDietaryList}>Dietary Preferences</button>
          {showDietaryList && (
            <ul>
              <li><input type="checkbox" /> Vegetarian</li>
              <li><input type="checkbox" /> Vegan</li>
              <li><input type="checkbox" /> Gluten-Free</li>
              <li><input type="checkbox" /> Dairy-Free</li>
            </ul>
          )}
        </div>
  
        <div>
          <button className="filter-button" onClick={handleToggleDeliveryTimeList}>Delivery Time</button>
          {showDeliveryTimeList && (
            <ul>
              <li><input type="checkbox" /> Fast Delivery</li>
              <li><input type="checkbox" /> Within 30 Minutes</li>
            </ul>
          )}
        </div>
  
        <div>
          <button  className="filter-button" onClick={handleToggleRatingsList}>Ratings and Reviews</button>
          {showRatingsList && (
            <ul>
              <li><input type="checkbox" /> 4 Stars and Above</li>
              <li><input type="checkbox" /> 3 Stars and Above</li>
              <li><input type="checkbox" /> 2 Stars and Above</li>
            </ul>
          )}
        </div>
  
        <div>
          <button className="filter-button" onClick={handleToggleLocationList}>Location</button>
          {showLocationList && (
            <ul>
              <li><input type="checkbox" /> Nearby</li>
              <li>Specific Area:
              <input
            type="text"
            value={specificArea}
            onChange={handleSpecificAreaChange}
            placeholder="Enter specific area"
          />
              </li>
            </ul>
          )}
        </div>
      </div>
    );
   }

   export default Sidebar;