import React from 'react';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import { useState ,useEffect} from 'react';
import '../User/Main.css';
import axios from 'axios';
import Sidebar from "../Sidebar/Sidebar";
import Brands from "../Brands/Brands";
import Header  from '../Header/Header';
import Advertisement from '../Ad/Advertisement';
import NavigationBar from '../Nav/NavigationBar';
import "./PartnerProfile.css"

const Main = () => {
  const location = useLocation();
  const sessionToken = location.state?.sessionToken;
  const handleLogout = () => {
    axios
      .post('http://localhost:8000/logout', { session_token: sessionToken })
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

  const PartnerProfile = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [vehicleDetails, setVehicleDetails] = useState("");
    const [photo, setPhoto] = useState(null);
    const [agreeTerms, setAgreeTerms] = useState(false);
  
    useEffect(() => {
      axios
        .get("http://localhost:8000/DeliveryPartnerLogin")
        .then((response) => {
          const { name, email, phoneNumber } = response.data;
          setName(name);
          setEmail(email);
          setPhoneNumber(phoneNumber);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }, []);
  
    const handleSubmit = (event) => {
      event.preventDefault();
      console.log("Vehicle Details:", vehicleDetails);
      console.log("Photo:", photo);
    };
  
    const handlePhotoChange = (event) => {
      const file = event.target.files[0];
      setPhoto(file);
    };

    const handleDetailing = (event) => {
        const file = event.target.files[0];
        setPhoto(file);
    }

    const handleCheckboxChange = (event) => {
        setAgreeTerms(event.target.checked);
      };
    
      return (
        <div>
            <div className="partner-profile-container">
          <div className="policies-terms" style={{width:"1400px"}}>
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
          <div className="form-container">
            <h2>Partner Profile</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Name:
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label>
                Email:
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              <label>
                Phone Number:
                <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </label>
              <label>
                Vehicle Details (PDF, JPG, JPEG):
                <input type="file" accept=".pdf,.jpg,.jpeg" onChange={handleDetailing} />
              </label>
              <label>
                Photo (PDF, JPG, JPEG):
                <input type="file" accept=".pdf,.jpg,.jpeg" onChange={handlePhotoChange} />
              </label>
              <button type="submit" disabled={!agreeTerms}>
                Submit
              </button>
            </form>
            </div>
          </div>
        </div>
      );
    };
  
  return (
    <div className='main'>
      <Header />
      <NavigationBar handleLogout={handleLogout} />
      <div className='container'>
      <Sidebar />
      <div className='content'>
      <PartnerProfile/>
      <Advertisement/>
      <h3>Browse by Brands :</h3>
      <Brands />
      </div>
      </div>
    </div>
  );
};

export default Main;
