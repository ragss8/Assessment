import React, { useState } from 'react';
import Feedback from '../Feedback/Feedback';
import './Addition.css';

const Addition = ({ addRestaurant }) => {
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [showDeliveryPartnerForm, setShowDeliveryPartnerForm] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const handleRestaurantClick = () => {
    setShowRestaurantForm(true);
  };

  const handleDeliveryPartnerClick = () => {
    setShowDeliveryPartnerForm(true);
  };

  const handleFeedbackClick = () => {
    setShowFeedbackForm(true);
  };

  return (
    <div className="partner-container">
      {showRestaurantForm ? (
      //   <div className="restaurant-form">
      //     <Restaurant addRestaurant={addRestaurant} />
      //   </div>
      // ) : (
      //   <div className="restaurant" onClick={handleRestaurantClick}>
      //     <div className="add-btn">+</div>
      //     <div className="partner-description">Add a restaurant</div>
      //   </div>
      // )}

      // {showDeliveryPartnerForm ? (
      //   <div className="delivery-partner-form">
      //     <Delivery />
      //   </div>
      // ) : (
      //   <div className="delivery" onClick={handleDeliveryPartnerClick}>
      //     <div className="add-btn">+</div>
      //     <div className="partner-description">Add a delivery partner</div>
      //   </div>
      // )}

      // {showFeedbackForm ? (
        <div className="feedback-form">
          <Feedback />
        </div>
      ) : (
        <div className="feedback" onClick={handleFeedbackClick}>
          <div className="add-btn">+</div>
          <div className="partner-description">Feedback on browsing experience</div>
        </div>
      )}
    </div>
  );
};

export default Addition;
