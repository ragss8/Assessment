import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRestaurantDetails } from './Action';
import './RestaurantCont.css';
import { useHistory } from 'react-router-dom';

const RestaurantContainer = ({ restaurant_id }) => {
  const dispatch = useDispatch();
  const { restaurantDetails, loading, error } = useSelector((state) => state.restaurant);
  const history = useHistory();

  useEffect(() => {
    dispatch(fetchRestaurantDetails(restaurant_id));
  }, [dispatch, restaurant_id]);

  const handleContainerClick = () => {
    history.push('/menu');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="details-container" onClick={handleContainerClick}>
      {restaurantDetails && (
        <>
          <h2>{restaurantDetails.restaurantName}</h2>
          <p>Address: {restaurantDetails.address}</p>
          <p>Phone Number: {restaurantDetails.phoneNumber}</p>
          <p>Email: {restaurantDetails.email}</p>
        </>
      )}
    </div>
  );
};

export default RestaurantContainer;
