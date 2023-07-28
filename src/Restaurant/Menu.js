import React, { useState ,useEffect} from 'react';
import axios from 'axios';
import Header from '../Header/Header';
// import Sidebar from '../Sidebar/Sidebar';
import './Menu.css';
import { useDispatch, Provider } from 'react-redux';
import MenuCont from './MenuRedux/MenuCont';
import store from './MenuRedux/Store';
import { fetchMenuItems } from './MenuRedux/MenuAction';

const Menu = () => {
  const [restaurantId, setRestaurantId] = useState(() => {
    const storedRestaurantId = localStorage.getItem('restaurantId');
    return storedRestaurantId || '';
  });
  
  const [item_name, setItem_name] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [ingredients, setIngredients] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    localStorage.setItem('restaurantId', restaurantId);
  }, [restaurantId]);

  const handleRestaurantIdChange = (event) => {
    setRestaurantId(event.target.value);
  };

  const handleNameChange = (event) => {
    setItem_name(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handlePriceChange = (event) => {
    setPrice(event.target.value);
  };

  const handleIngredientsChange = (event) => {
    setIngredients(event.target.value);
  };

  const handleAddItem = () => {
    const newItem = {
      restaurant_id: restaurantId,
      item_name,
      description,
      price,
      ingredients,
    };

    axios
      .post(`http://localhost:8002/menu/${restaurantId}`, newItem)
      .then((response) => {
        console.log(response.data);
        setItem_name('');
        setDescription('');
        setPrice('');
        setIngredients('');
        dispatch(fetchMenuItems(restaurantId));
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div>
      <Header />
      <div className="container">
        {/* <Sidebar /> */}
        <div className="menu-container">
          <h2 className="menu-heading">Menu</h2>
          <form className="menu-form">
          <label className="menu-label">
                Enter User ID for inserting Menuitems:
              </label>
            <input
              type="text"
              className="menu-input"
              placeholder="Restaurant ID"
              value={restaurantId}
              onChange={handleRestaurantIdChange}
              style={{width:"150px"}}
            />
            <br />
            <div className="menu-input-row">
              <label className="menu-label">
                Enter the info to display the dishes:
              </label>
              <label className="menu-label">
                <input
                  type="text"
                  className="menu-input"
                  placeholder="Dish-name"
                  value={item_name}
                  onChange={handleNameChange}
                />
              </label>
              <label className="menu-label">
                <input
                  type="text"
                  className="menu-input"
                  placeholder="Description..."
                  value={description}
                  onChange={handleDescriptionChange}
                />
              </label>
              <label className="menu-label">
                <input
                  type="number"
                  className="menu-input"
                  placeholder="Price"
                  value={price}
                  onChange={handlePriceChange}
                />
              </label>
              <label className="menu-label">
                <input
                  type="text"
                  className="menu-input"
                  placeholder="Ingredients"
                  value={ingredients}
                  onChange={handleIngredientsChange}
                />
              </label>
              <button type="button" className="menu-button" onClick={handleAddItem}>
                Add Item
              </button>
            </div>
          </form>
          <MainMenu restaurant_id={restaurantId} />
        </div>
      </div>
    </div>
  );
};

const MainMenu = ({ restaurant_id }) => {
  return (
    <Provider store={store}>
      <div className="app-container">
        <form>
          <label className="restaurant-label" style={{ display: 'none' }}>
            Enter Restaurant ID:
            <input
              className="restaurant-input"
              type="text"
              value={restaurant_id}
              readOnly
              required
            />
          </label>
        </form>
        <MenuCont restaurant_id={restaurant_id} />
      </div>
    </Provider>
  );
};

export default Menu;
