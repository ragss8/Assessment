import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRestaurants, fetchMenuItems, fetchOrderDetails } from '../RestaurantRedux/Action';
import axios from 'axios';
import '../RestaurantRedux/Rest.css';

const App = () => {
  const dispatch = useDispatch();
  const { restaurants, menuItems, loading, error, orderDetails } = useSelector((state) => state.restaurant);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [orderItems, setOrderItems] = useState({});
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phonenumber, setPhonenumber] = useState('');
  const [email, setEmail] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [, setError] = useState(null);
  const [, setOrderIdInput] = useState('');
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    dispatch(fetchRestaurants());
  }, [dispatch]);

  const handleRestaurantClick = (restaurantName) => {
    setSelectedRestaurant(restaurantName);
    dispatch(fetchMenuItems(restaurantName));
  };

  const handleIncrement = (itemName) => {
    setOrderItems((prevOrderItems) => ({
      ...prevOrderItems,
      [itemName]: (prevOrderItems[itemName] || 0) + 1,
    }));
  };

  const handleDecrement = (itemName) => {
    setOrderItems((prevOrderItems) => ({
      ...prevOrderItems,
      [itemName]: Math.max((prevOrderItems[itemName] || 0) - 1, 0),
    }));
  };

  const handleConfirmOrder = () => {
    const orderData = {
      restaurantName: selectedRestaurant,
      name: name,
      address: address,
      phonenumber: phonenumber,
      items: orderItems,
    };

    axios
      .post(`http://localhost:8002/orders/${selectedRestaurant}`, orderData)
      .then((response) => {
        console.log('Order Confirmed:', response.data);
        const orderId = response.data.order_id;
        setOrderIdInput(orderId);
        dispatch(fetchOrderDetails(orderId)); // Fetch order details using Redux Thunk
        setShowOrderDetails(true); // Show the overlay
      })
      .catch((error) => {
        console.error('Error confirming order:', error);
      });
  };

  const handleInputChange = (e) => {
    setEmail(e.target.value);
  };

  const getUserDetails = (email) => {
    axios
      .get(`http://localhost:8000/user/${email}`)
      .then((response) => {
        setUserDetails(response.data);
        setError(null);
      })
      .catch((error) => {
        setUserDetails(null);
        setError(error.response?.data?.detail || 'User not found');
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    getUserDetails(email);
    if (userDetails) {
      setName(userDetails.name);
      setAddress(userDetails.address);
      setPhonenumber(userDetails.phone_number);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="rest-container">
      <ul className='list'>
        {restaurants.map((restaurant) => (
          <li
            key={restaurant.restaurantName}
            className='rest-li'
            onClick={() => handleRestaurantClick(restaurant.restaurantName)}
          >
            <strong>{restaurant.restaurantName}</strong>
            <div className="restaurant-details">
              <div>{restaurant.address}</div>
              <div>Cuisine Type: {restaurant.cuisineType}</div>
              <div>Delivery Time: {restaurant.deliveryTime}</div>
              <div>Average Rating: {restaurant.averageRating}</div>
            </div>
          </li>
        ))}
      </ul>

      {selectedRestaurant && (
        <div className="menu-overlay">
          <div className="menu-content">
            <h2>Menu Items for {selectedRestaurant}</h2>
            <ul>
              {menuItems.map((item) => (
                <li key={item.item_name}>
                  <strong>{item.item_name}</strong> - {item.description} - {item.ingredients} - ${item.price}
                  <div className='increment'>
                    <button onClick={() => handleDecrement(item.item_name)}>-</button>
                    {orderItems[item.item_name] || 0}
                    <button onClick={() => handleIncrement(item.item_name)}>+</button>
                  </div>
                </li>
              ))}
            </ul>
            <div>
              <form onSubmit={handleSubmit}>
                <label>Enter you email to get details of phone,name and address :</label>
                <input type="email" value={email} onChange={handleInputChange} style={{ width: "20%" }} /><br/>
                <button type="submit" style={{ width: "15%",margin:"10px" }}>Get User Details</button>
              </form>
              {userDetails && (
                <div>
                  <p>Name: {userDetails.name}</p>
                  <p>Email: {userDetails.email}</p>
                  <p>Address: {userDetails.address}</p>
                  <p>Phone Number: {userDetails.phone_number}</p>
                </div>
              )}
              {error && <p>Error: {error}</p>}
            </div>
            <div>
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: "30%", border: "1px solid black", marginBottom: "10px" }}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Your Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ width: "100%", border: "1px solid black", marginBottom: "10px" }}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Your Phone Number"
                value={phonenumber}
                onChange={(e) => setPhonenumber(e.target.value)}
                style={{ width: "100%", border: "1px solid black", marginBottom: "10px" }}
              />
            </div>

            <button onClick={handleConfirmOrder} style={{ width: 'max-content' }}>Confirm Order</button>
            <button onClick={() => setSelectedRestaurant(null)}>Close</button>
          </div>
        </div>
      )}
      {showOrderDetails && orderDetails && (
        <div className="order-details-overlay">
          <div className="order-details-content">
            <h3>Order Details</h3>
            <p>Order ID: {orderDetails.order_id}</p>
            <p>Name: {orderDetails.name}</p>
            <p>Address: {orderDetails.address}</p>
            <p>Phone Number: {orderDetails.phonenumber}</p>
            <p>Restaurant Name: {orderDetails.restaurant_name}</p>
            <p>Total Price: {orderDetails.total_price}</p>
            <p>Items:</p>
            <ul>
              {orderDetails.order_items.map((item) => (
                <li key={item.item_name}>
                  {item.item_name} - Quantity: {item.quantity} - Price per item: ${item.price_per_item}
                </li>
              ))}
            </ul>
            <button onClick={() => setShowOrderDetails(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
