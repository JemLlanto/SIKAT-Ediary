import React, { useState, useEffect, useRef } from "react";
import sampleImage from "../../../assets/Background.jpg";
import Carousel from "react-bootstrap/Carousel";

const IndexCarousel = ({ images }) => {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  // Ensure images is an array and has data before trying to map
  if (!Array.isArray(images) || images.length === 0) {
    return <div>Loading...</div>; // Or a more appropriate fallback, e.g., empty state
  }

  return (
    <Carousel activeIndex={index} onSelect={handleSelect}>
      {images.map((image) => (
        <Carousel.Item
          className="position-relative overflow-hidden"
          key={image.id}
          interval={2000}
        >
          <div className="carouselBlackFade"></div>
          <div
            className="overflow-x-hidden"
            style={{
              width: "100dvw",
              height: "clamp(30rem, 80dvw, 90dvh)",
            }}
          >
            <img
              className=""
              src={
                image && image.image_path
                  ? `http://localhost:8081${image.image_path}`
                  : sampleImage
              }
              alt={image.title}
              style={{
                height: "100%",
                width: "100%",
                objectFit: "contain",
              }}
            />
            <div
              className="position-absolute"
              style={{
                height: "130%",
                width: "130%",
                background: `url(http://localhost:8081${image.image_path})`,
                filter: "blur(1rem)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                top: "-.7rem",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: "-1",
              }}
            ></div>
          </div>

          <Carousel.Caption>
            <h4>{image.title}</h4>
            <p>{image.description}</p>
          </Carousel.Caption>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default IndexCarousel;
