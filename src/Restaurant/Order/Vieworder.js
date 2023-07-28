import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrdersByRestaurant } from './Action';

const ViewOrders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);
  const [restaurantName, setRestaurantName] = useState('');
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const handleViewOrders = () => {
    if (restaurantName.trim() !== '') {
      dispatch(fetchOrdersByRestaurant(restaurantName));
      setIsButtonClicked(true);
    }
  };

  const toggleOrderDetails = (orderId) => {
    setSelectedOrderId((prevOrderId) => (prevOrderId === orderId ? null : orderId));
  };

  const handleCloseOverlay = () => {
    setIsButtonClicked(false);
    setSelectedOrderId(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className='orders'>
      <input
        type='text'
        value={restaurantName}
        onChange={(e) => setRestaurantName(e.target.value)}
        placeholder='Enter Your Restaurant Name'
        style={{border:"2px solid black",borderRadius:"5px",width:"200px",height:"30px", marginBottom:"15px"}}
      />
      <button onClick={handleViewOrders} style={{width:"max-content"}}>View Orders</button>
      {isButtonClicked && restaurantName.trim() !== '' && orders.length > 0 && (
        <div className='orders-overlay'>
          <div className='orders-container'>
            <div className='close-button' onClick={handleCloseOverlay}>
              Close
            </div>
            <h3>Orders for {restaurantName}</h3>
            <ul className='orders-list'>
              {orders.map((order) => (
                <li key={order._id}>
                  <div className='order-summary' onClick={() => toggleOrderDetails(order._id)}>
                    <p>Order ID: {order._id}</p>
                    <p>Name: {order.name}</p>
                  </div>
                  {selectedOrderId === order._id && (
                    <div className='order-details-dropdown'>
                    <h3>Order Details</h3>
                    <p>Total Price: {order.total_price}</p>
                    <p>Restaurant Name: {order.restaurant_name}</p>
                    <p>Phone Number: {order.phonenumber}</p>
                    <p>Address: {order.address}</p>
                    <h4>Order Items:</h4>
                    <ul>
                      {order.order_items.map((item, index) => (
                        <li key={index}>
                          <p>Item Name: {item.item_name}</p>
                          <p>Quantity: {item.quantity}</p>
                          <p>Price Per Item: {item.price_per_item}</p>
                        </li>
                      ))}
                    </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewOrders;