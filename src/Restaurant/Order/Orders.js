import React from "react";
import { Provider } from "react-redux";
import rootstore from "./rootstore";
import ViewOrders from "./Vieworder";

const Order = () => {
    return(
        <Provider store={rootstore}>
            <ViewOrders />
        </Provider>
    );
};

export default Order;