import React, { useState, useEffect, useRef } from "react";
import sampleImage from "../../../assets/Background.jpg";
import Carousel from "react-bootstrap/Carousel";

const IndexCarousel = ({ isLoading, images }) => {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  return (
    <Carousel activeIndex={index} onSelect={handleSelect}>
      {isLoading ? (
        <Carousel.Item className="position-relative overflow-hidden">
          <div
            className="overflow-x-hidden d-flex align-items-center justify-content-center"
            style={{
              width: "100dvw",
              height: "clamp(30rem, 80dvw, 90dvh)",
            }}
          >
            <h2>
              <i className="bx bx-loader bx-spin"></i>
            </h2>
            <div
              className="position-absolute"
              style={{
                height: "130%",
                width: "130%",
                // background: `url(${sampleImage})`,
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
            <h4 className="m-0 text-dark">Loading images...</h4>
          </Carousel.Caption>
        </Carousel.Item>
      ) : images.length === 0 ? (
        <Carousel.Item className="position-relative overflow-hidden">
          <div
            className="overflow-x-hidden d-flex align-items-center justify-content-center"
            style={{
              width: "100dvw",
              height: "clamp(30rem, 80dvw, 90dvh)",
            }}
          >
            <h1>
              <i className="bx bx-image-alt"></i>
            </h1>
            <div
              className="position-absolute"
              style={{
                height: "130%",
                width: "130%",
                // background: `url(${sampleImage})`,
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
            <h4 className="m-0 text-dark">No images to display.</h4>
          </Carousel.Caption>
        </Carousel.Item>
      ) : (
        images.map((image) => (
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
                src={image.image_path}
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
                  background: `url(${image.image_path})`,
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
        ))
      )}
    </Carousel>
  );
};

export default IndexCarousel;
