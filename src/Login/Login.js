import React, { useState } from "react";
import { useHistory } from 'react-router-dom';
import './Login.css';
import UserLogin from "../User/UserLogin";
import RestaurantOwnerLogin from "../Restaurant/RestoLogin";
import DeliveryPartnerLogin from "../Delivery/DeliveryLogin";

const Login = () => {
  const [activeForm, setActiveForm] = useState('UserLogin');
  const history = useHistory();

  const toggleForm = (form) => {
    setActiveForm(form);
  };

  const handleLoginSuccess = (userType) => {
    if (userType === 'user') {
      history.push('/Main'); 
    } else if (userType === 'restaurant') {
      history.push('/Restaurant'); 
    } else if (userType === 'delivery') {
      history.push('/Delivery'); 
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
      <div className="toggle-buttons">
        <button
          className={activeForm === 'UserLogin' ? 'toggle-button active' : 'toggle-button'}
          onClick={() => toggleForm('UserLogin')}
        >
          User
        </button>
        <button
          className={activeForm === 'RestaurantOwnerLogin' ? 'toggle-button active' : 'toggle-button'}
          onClick={() => toggleForm('RestaurantOwnerLogin')}
        >
          Restaurant Owner
        </button>
        <button
          className={activeForm === 'DeliveryPartnerLogin' ? 'toggle-button active' : 'toggle-button'}
          onClick={() => toggleForm('DeliveryPartnerLogin')}
        >
          Delivery Partner
        </button>
      </div>
      {activeForm === 'UserLogin' && <UserLogin onLoginSuccess={() => handleLoginSuccess('user')} />}
      {activeForm === 'RestaurantOwnerLogin' && <RestaurantOwnerLogin onLoginSuccess={() => handleLoginSuccess('restaurant')} />}
      {activeForm === 'DeliveryPartnerLogin' && <DeliveryPartnerLogin onLoginSuccess={() => handleLoginSuccess('delivery')} />}
    </div>
  );
};

export default Login;
