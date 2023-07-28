import React, { useState } from 'react';
import './Signup.css';
import Restaurant from '../Restaurant/RestaurantSignup';
import Delivery from '../Delivery/DeliverySignup';
import User from '../User/User';

const SignUp = () => {
  const [activeForm, setActiveForm] = useState('user');

  const toggleForm = (form) => {
    setActiveForm(form);
  };

  return (
    <div className="signup-container">
      <h2 className="signup-title">Sign Up</h2>
      <div className="toggle-buttons">
        <button
          className={activeForm === 'user' ? 'toggle-button active' : 'toggle-button'}
          onClick={() => toggleForm('user')}
        >
          User
        </button>
        <button
          className={activeForm === 'restaurant' ? 'toggle-button active' : 'toggle-button'}
          onClick={() => toggleForm('restaurant')}
        >
          Restaurant Owner
        </button>
        <button
          className={activeForm === 'delivery' ? 'toggle-button active' : 'toggle-button'}
          onClick={() => toggleForm('delivery')}
        >
          Delivery Partner
        </button>
      </div>
      {activeForm === 'user' && <User />}
      {activeForm === 'restaurant' && <Restaurant />}
      {activeForm === 'delivery' && <Delivery />}
    </div>
  );
  };  

export default SignUp;



