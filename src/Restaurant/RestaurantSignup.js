import React, { useState } from 'react';
import '../Signup/Signup.css';
import axios from 'axios';
import RestoLogin from './RestoLogin';

const Restaurant = () => {
  const [restaurantName, setRestaurantName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRestaurantSubmit = async (e) => {
    e.preventDefault();

    try{
      const response = await axios.post('http://localhost:8002/restaurantsignup',{
      restaurantName: restaurantName,
      email:email,
      password:password, 
    });
    console.log('signup response:',response.data);
    setRestaurantName('');
    setEmail('');
    setPassword('');
    console.log("signup successful for restaurant");
    setIsSuccess(true);
    }catch(error){
      console.error('signup error:',error);
    }
  };

  if(isSuccess){
    return(
      <div className='login-container'>
        <h2 className='login-title'>Restaurant Login</h2>
        <RestoLogin />
      </div>
    )
  }

  return (
    <div className="form-container">
      <h2>Add Restaurant</h2>
      <form onSubmit={handleRestaurantSubmit}>
        <label>
          Restaurant Name: <span className="important-field">*</span>
          <input
            type="text"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            required
          />
        </label>
        <label>
          Email: <span className='important-field'>*</span>
          <input 
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}/>
        </label>
        <label>
          Password: <span className='important-field'>*</span>
          <input 
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}/>
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Restaurant;
