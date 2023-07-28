import React from "react";
import "./Display.css";
import image1 from "../images/pizza.png";
import image2 from "../images/biryani.jpeg";
import image3 from "../images/burger.png";
import image4 from "../images/dosa.jpeg";
import image5 from "../images/icecream.png";
import image6 from "../images/rolls.jpeg";
import image7 from "../images/tea.jpeg";
import image8 from "../images/cake.png";

const Display = () => {
    return (
      <div className="display">
        <div className='image-container'>
        <img src={image1} alt="Pizza" />
        <p className="description">pizza</p>
        </div>
        <div className='image-container'>
        <img src={image2} alt="Pizza" />
        <p className="description">Biryani</p>
        </div>
        <div className='image-container'>
        <img src={image3} alt="Pizza" />
        <p className="description">Burger</p>
        </div>
        <div className='image-container'>
        <img src={image4} alt="Pizza" />
        <p className="description">Dosa</p>
        </div>
        <div className='image-container'>
        <img src={image5} alt="Pizza" />
        <p className="description">Ice-Cream</p>
        </div>
        <div className='image-container'>
        <img src={image6} alt="Pizza" />
        <p className="description">Rolls</p>
        </div>
        <div className='image-container'>
        <img src={image7} alt="Pizza" />
        <p className="description">Cake</p>
        </div>
        <div className='image-container'>
        <img src={image8} alt="Pizza" />
        <p className="description">Tea</p>
        </div>
      </div>
    );
  };

  export default Display;