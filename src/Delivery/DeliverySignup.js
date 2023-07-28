import React, { useState } from 'react';
import '../Feedback/feedback-form.css';
import '../Signup/Signup.css';
import axios from 'axios';
import DeliveryLogin from "./DeliveryLogin";

const Delivery = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSuccess,setIsSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      const response = await axios.post('http://localhost:8000/Deliverysignup', {
        name,
        email,
        password,
        phoneNumber,
      });
  
      console.log('Signup response:', response.data);
      setName('');
      setEmail('');
      setPassword('');
      setPhoneNumber('');
      console.log("signup successful of Delivery Partner");
      setIsSuccess(true);
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  if(isSuccess){
    return(
      <div className='login-container'>
        <h2 className='login-title'>Restaurant Login</h2>
        <DeliveryLogin />
      </div>
    )
  }

  return (
    <div className="form-container">
      <h2>Add Delivery Partner</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:<span className="important-field">*</span></label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number:<span className="important-field">*</span></label>
          <input
            type="text"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:<span className="important-field">*</span></label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:<span className="important-field">*</span></label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Delivery;
