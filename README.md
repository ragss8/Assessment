1.Introduction:
This is a clone of food delivery app , that basically should do things like
- user logins orders a food
- the system picks up near by drivers
- assigns them and show them on the map
- real location,Just like how swiggy works but with minimal operations.


2.what has been done the past week?
-Home page , that has welcome page and the rendering of main component and auto detect the location using "opencageData"
-It has got signup and Login Buttons to access the main component.
*On clicking you get the forms for respective users may be the
--Application_User
--Restaurant_Owner
--Delivery_Partner
*Same goes on with the Login 
IMPLEMENTED BACKEND CODE FOR CREATIN USER, LOGGING IN, STORING THE INFO FOR THE SAME, LOGOUT(Not working as of now,as implemention for storing the session_tokens and logging out is remaining)endpoints.
Note: Both for Login and Signup The forms render on the same page on the App Component as an overlay.


3.->The implementation for major operations is done .
  what has been implemented?
--Storing the Restaurant Information by post Request.
--Using Redux thunk retrieving the RestaurantDetails as a prop to show the Restaurant_Name,delivery_Time and contact_Info as of now and show up in the Restaurant_Container
--same goes for Delivery like Storing the Delivery_Partners Information.
-adding menuItems under the Object_id's of the restaurant and storing the same and making it accessible on the restaurantList-container, this would be ready for selecting the items and adding it to cart for ordering it.

4.What is remaining?
-create a Handle the form submission and send the order details to the backend.
still three functionalities are remaining as of now:

5.Backend Driver Selection:
-Implement a backend algorithm or logic to select nearby drivers based on the user's location and driver availability.
Retrieve the driver information from the backend and send it back to the frontend.
Frontend Driver Display:

-Create a component to display the available drivers.
Receive the driver information from the backend and render it in the component.
Driver Selection, send the selected driver information to the backend for further processing.

  
# Assessment
