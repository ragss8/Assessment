import React, { useState } from 'react';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import '../User/Main.css';
import axios from 'axios';
import Header from '../Header/Header';
import NavigationBar from '../Nav/NavigationBar';
import RestaurantInfo from './Redux/RestaurantInfo';
import Order from './Order/Orders';
import "./Order/Vieworder.css";

const Restaurant = () => {
  const location = useLocation();
  const sessionToken = location.state?.sessionToken;

  const handleLogout = () => {
    axios
      .post('http://localhost:8002/logout', { session_token: sessionToken })
      .then((response) => {
        console.log('User logged out');
      })
      .catch((error) => {
        console.error('Logout failed:', error);
        if (error.response) {
          console.log('Response data:', error.response.data);
        }
      });
  };

  const RestaurantForm = () => {
    const [userId, setUserId] = useState('');
    const [restaurantName, setRestaurantName] = useState('');
    const [address, setAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [cuisineType, setCuisineType] = useState('');
    const [openingHours, setOpeningHours] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');
    const [averageRating, setAverageRating] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);

    const handleRestaurantSubmit = (event) => {
      event.preventDefault();

      if (!restaurantName || !address || !phoneNumber || !email || !cuisineType || !openingHours || !deliveryTime || !averageRating) {
        console.error('All fields are required');
        return;
      }

      const payload = {
        restaurantName,
        address,
        phoneNumber,
        email,
        cuisineType,
        openingHours: new Date().toISOString().substr(11, 5),
        deliveryTime,
        averageRating,
      };

      const url = `http://localhost:8002/update-restaurant/${email}`;
      axios
        .put(url, payload)
        .then((response) => {
          console.log('Restaurant information updated successfully:', response.data);
        })
        .catch((error) => {
          console.error('Error updating restaurant information:', error);
        });
    };

    const handleCheckboxChange = (event) => {
      setAgreeTerms(event.target.checked);
    };

    const handleGetUserId = async () => {
      try {
        const response = await axios.get(`http://localhost:8002/get-user-id/${email}`);
        setUserId(response.data._id);
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };


    return (
      <div>
        <Order
        />
        <div className="policies-terms" style={{ width: "1400px" }}>
           <h2>Terms and Conditions *</h2>
            <p>Privacy Policy: The privacy policy describes how the app collects, uses, and protects the personal information of the food delivery partners. It may include details about data sharing, storage, and security measures.</p>
            <p>Acceptable Use Policy: The acceptable use policy sets forth guidelines for the appropriate and responsible use of the app and its services. It may prohibit actions such as harassment, discrimination, fraud, or any illegal activities.</p>
            <p>Code of Conduct: The code of conduct outlines expected behavior and professional conduct for food delivery partners. It may include guidelines on professionalism, punctuality, proper attire, and customer interactions.</p>
            <p>Insurance and Liability: The app may require food delivery partners to maintain appropriate insurance coverage for their vehicles, liability, and personal injury. It may outline the responsibilities and liabilities of partners in case of accidents or damages during delivery.</p>
            <p>Modification and Termination: The app may state its right to modify the terms and conditions, policies, or notices at any time. It may also outline the circumstances under which the partnership agreement can be terminated by either party.</p>
            <p>Dispute Resolution: The app may provide information on the process for resolving disputes, including mediation or arbitration procedures, and the jurisdiction or governing law applicable to any legal actions.</p>
            <p>Compliance with Laws: The agreement may emphasize the obligation for food delivery partners to comply with all applicable laws and regulations related to food safety, transportation, employment, and any other relevant legislation.</p>
            <p>Communication and Notices: The app may specify how it will communicate with partners and deliver important notices or updates, such as changes in policies or service updates. It may require partners to maintain updated contact information.</p>
          <label>
            <input type="checkbox" checked={agreeTerms} onChange={handleCheckboxChange} />
            <b>I agree to the terms and policies.</b>
          </label>
        </div>
        <div className="restaurant-form" style={{ marginBottom: "30px" }}>
          <h2>Restaurant Form</h2>
          <p>Note:</p>
          <ol>
            <li><i>Enter your email address correctly else it won't be updated.</i></li>
            <li><i>Also use the same form to update your information</i></li>
          </ol>
          <form onSubmit={handleRestaurantSubmit}>
            <label>
              Restaurant Name:
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                required
              />
            </label>
            <label>
              Address:
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </label>
            <label>
              Phone Number:
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label>
              Cuisine Type:
              <input
                type="text"
                value={cuisineType}
                onChange={(e) => setCuisineType(e.target.value)}
                required
              />
            </label>
            <label>
              Opening Hours:
              <input
                type="time"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                step="900"
                required
              />
            </label>
            <label>
              Delivery Time:
              <input
                type="text"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                required
              />
            </label>
            <label>
              Average Rating:
              <input
                type="number"
                value={averageRating}
                onChange={(e) => setAverageRating(e.target.value)}
                step="0.1"
                min="0"
                max="5"
                required
              />
            </label>
            <button type="submit" disabled={!agreeTerms}>
              Submit
            </button>
            <div style={{ display: "none" }}>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <p>Click Below!!Copy the UserID for further Purposes:</p>
            <button onClick={handleGetUserId}>Get ID</button>
            {userId && <p>User ID: {userId}</p>}
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className='main'>
      <Header />
      <NavigationBar handleLogout={handleLogout} />
      <div className='container'>
        <div className='content'>
          <RestaurantForm />
          <RestaurantInfo />
        </div>
      </div>
    </div>
  );
};

export default Restaurant;