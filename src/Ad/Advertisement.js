import React,{useEffect, useRef, useState} from "react";
import "./Advertisement.css";
import foodImage1 from '../images/pexels-ella-olsson-1640772.jpg';
import foodImage2 from '../images/pexels-alexy-almond-3756523.jpg';
import foodImage3 from '../images/pexels-sebastian-coman-photography-3655916.jpg';
import foodImage4 from '../images/pexels-terje-sollie-299347.jpg';

const Advertisement = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images1 = [foodImage1, foodImage2, foodImage3,foodImage4];
    const imageRef = useRef(null);
  
    useEffect(() => {
      const changeImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images1.length);
      };
  
      const imageIntervalId = setInterval(changeImage, 4000);
  
      return () => {
        clearInterval(imageIntervalId);
      };
    }, [images1.length]);
  
    const nextSlide = () => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images1.length);
    };
  
    const prevSlide = () => {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images1.length) % images1.length);
    };
  
    return (
      <div className="ad">
        <div className="ad-container">
          <div className="ad-content">
            <img
              src={images1[currentImageIndex]}
              alt={`Advertisement ${currentImageIndex + 1}`}
              ref={imageRef}
              className={currentImageIndex === 0 ? 'fade-in' : 'fade-out'}
            />
          </div>
        </div>
        <div className="ad-manual-buttons">
          <div className="ad-button" onClick={prevSlide}>
            &lt;
          </div>
          <div className="ad-button" onClick={nextSlide}>
            &gt;
          </div>
        </div>
      </div>
    );
  };

  export default Advertisement;