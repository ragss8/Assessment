import React, { useState } from 'react';
import axios from 'axios';
import './User.css';
import UserLogin from './UserLogin';

const SignUp = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('http://localhost:8000/signup', {
        name: fullName,
        email,
        password,
        phone_number: phoneNumber,
        address,
      });
  
      console.log('SignUp response:', response.data);
  
      setFullName('');
      setEmail('');
      setPassword('');
      setPhoneNumber('');
      setAddress('');
      console.log("signup successful");
      setIsSuccess(true);
    } catch (error) {
      console.error('SignUp error:', error);
    }
  };
  
  if (isSuccess) {
    return (
      <div className="login-container">
        <h2 className="login-title">Login</h2>
        <UserLogin />
      </div>
    );
  }

  return (
    <div className="signup-container">
      <h2 className="signup-title">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div>
          <label htmlFor="fullName">Full Name:<span className="important-field">*</span></label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="email">Email:<span className="important-field">*</span></label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password:<span className="important-field">*</span></label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="phoneNumber">Phone Number:<span className="important-field">*</span></label>
          <input
            type="text"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="address">Address:<span className="important-field">*</span></label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <button type="submit">SignUp</button>
        </form>
    </div>
  );
};

export default SignUp;
