import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMenuItems,deleteMenuItem } from '../MenuRedux/MenuAction';
import './MenuCont.css'; 

const MenuCont = ({ restaurant_id }) => {
  const dispatch = useDispatch();
  const { menuDetails, loading, error } = useSelector((state) => state.menu);

  useEffect(() => {
    dispatch(fetchMenuItems(restaurant_id));
  }, [dispatch, restaurant_id]);

  const handleDeleteItem = (item) => {
    dispatch(deleteMenuItem(restaurant_id, item.item_name));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="menu-container1">
      {menuDetails && (
        <>
          <h2 className="menu-title">Menu Items</h2>
          <ol>
            {menuDetails.map((item) => (
              <li key={item.menu_item_id} className="menu-item">
                <input type="checkbox" className="menu-checkbox" />
                <span>
                  <strong>{item.item_name}</strong> - {item.description} - {item.ingredients} - ${item.price}
                </span>
                <button
                  type="button"
                  className="menu-delete-button"
                  onClick={() => handleDeleteItem(item)}
                >
                  X
                </button>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
};

export default MenuCont;
