import React, { useState, useEffect, useRef } from 'react';
import foodImage1 from '../images/pexels-ella-olsson-1640772.jpg';
import foodImage2 from '../images/pexels-alexy-almond-3756523.jpg';
import foodImage3 from '../images/pexels-sebastian-coman-photography-3655916.jpg';
import foodImage4 from '../images/pexels-terje-sollie-299347.jpg';
import './Location.css';
import Signup from '../Signup/Signup';
import Login from '../Login/Login';

function LocationInput({ onSignupClick , onLoginClick}) {
  const [location, setLocation] = useState('');
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('Hungry?');
  const [messageIndex, setMessageIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [foodImage1, foodImage2, foodImage3, foodImage4];
  const signupRef = useRef();
  const loginRef = useRef();

  useEffect(() => {
    const messageQueue = [
      ' "Hungry?" ',
      ' "Unexpected Guests?"',
      '"Cravings for cakes?"',
      ' "Your Favorite Food delivery Partner"',
      '"Directly to your doorstep"',
      '"Good food within minutes"',
      '"Delivering happiness"',
      '"Straight out of the kitchen to your doorstep"',
      '"The best service to fulfill your expectation"',
      '"Delivering lip-smacking food is our passion"',
      '"We deliver it hot and yummy"',
    ];

    const displayNextMessage = () => {
      setCurrentMessage(messageQueue[messageIndex]);
      setMessageIndex((prevIndex) => (prevIndex + 1) % messageQueue.length);
    };

    const messageIntervalId = setInterval(displayNextMessage, 1500);

    return () => {
      clearInterval(messageIntervalId);
    };
  }, [messageIndex]);

  useEffect(() => {
    const changeImage = () => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const imageIntervalId = setInterval(changeImage, 3000);

    return () => {
      clearInterval(imageIntervalId);
    };
  }, [images.length]);

  const handleInputChange = (event) => {
    setLocation(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Location:', location);
  };

  const handleAutoDetect = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log(position.coords);
          try {
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=9b298ff42629410aa521aaa2f8e5a524`
            );
            const data = await response.json();
            const address = data.results[0].formatted;
            console.log('Current Address:', address);
            setLocation(address);
          } catch (error) {
            console.error('Geolocation Error:', error);
          }
        },
        (error) => {
          console.error('Geolocation Error:', error);
        }
      );
    }
  };

  const handleSignupClick = () => {
    setShowSignupForm(true);
  };

  const handleLoginClick = () => {
    setShowLoginForm(true);
  };

  const handleCloseSignupForm = (event) => {
    if (event.target === signupRef.current) {
      setShowSignupForm(false);
    }
  };

  const handleCloseLoginForm = (event) => {
    if (event.target === loginRef.current) {
      setShowLoginForm(false);
    }
  };

  return (
    <div className="location-container">
      {showSignupForm && (
        <div className="signup-overlay" ref={signupRef} onClick={handleCloseSignupForm}>
          <div className="signup-form">
            <button className="close-button" onClick={() => setShowSignupForm(false)}>
              X
            </button>
            <Signup />
          </div>
        </div>
      )}
      {showLoginForm && (
        <div className="login-overlay" ref={loginRef} onClick={handleCloseLoginForm}>
          <div className="login-form">
            <button className="close-button" onClick={() => setShowLoginForm(false)}>
              X
            </button>
            <Login />
          </div>
        </div>
      )}
      <img src={images[currentImageIndex]} alt="Food" className="food-image" />
      <div className="location-form-container">
        <h2 className="location-title">Detect Location</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={location}
            onChange={handleInputChange}
            placeholder="Enter your location"
            className="location-input"
          />
          {/* <button type="submit" className="location-submit">
            Search
          </button> */}
        </form>
        <p className="auto-detect" onClick={handleAutoDetect}>
          Auto Detect
        </p>
        <div className="quote">
          <p className="morphic-text">{currentMessage}</p>
        </div>
      </div>
      <div className="btn">
        <button onClick={handleSignupClick}>SignUp</button>
        <button onClick={handleLoginClick}>Login</button>
      </div>
    </div>
  );
}

export default LocationInput;


