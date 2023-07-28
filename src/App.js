import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import LocationInput from './Location';
import Logo from './Logo';
import Main from './Main';
import './App.css';

function App() {
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowWelcomeMessage(false);
    }, 2500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const handleSignupClick = () => {
    history.push('/login');
  };

  const handleLoginClick = () => {
    setIsLoggedIn(true);
  };  

  return (
    <div className="App">
      {showWelcomeMessage ? (
        <div className="welcome-message">
          <p className="welcome-text">Welcome to "KHATEJAO"<br />- co-powered by SWIGGY</p>
        </div>
      ) : isLoggedIn ? (
        <Main />
      ) : (
        <>
          <Logo />
          <LocationInput onSignupClick={handleSignupClick} onLoginClick={handleLoginClick} />
        </>
      )}
    </div>
  );
}

export default App;

