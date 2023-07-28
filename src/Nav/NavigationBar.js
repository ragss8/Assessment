import React from "react";
import "./NavigationBar.css";

const NavigationBar = ({ handleLogout }) => {
    // const [sessionToken, setSessionToken] = useState('');
  
    // const handleLogoutClick = () => {
    //   handleLogout(sessionToken);
    //   setSessionToken('');
    // };
  
    // const handleSessionTokenChange = (event) => {
    //   setSessionToken(event.target.value);
    // };
    return (
      <div className="navigation-bar">
        <ul className="nav-list">
          <li className="nav-item">Home</li>
          <li className="nav-item">Order Food</li>
          <li className="nav-item">Cart</li>
          {/* <li className="nav-item">Delivery Partner</li> */}
        </ul>
        <div className="logout">
          {/* <input type="text" defaultValue={sessionToken} onChange={handleSessionTokenChange} style={{ display: 'none' }} /> */}
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
    );
  };

  
  export default NavigationBar;