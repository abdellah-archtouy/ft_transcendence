import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import Card from "./Card"; // Assuming you have a Card component

function Carousel({ friends, handleAddFriend }) {
  const [settings, setSettings] = useState({
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    initialSlide: 0,
    arrows: true,
  });

  useEffect(() => {
    // Function to update the settings based on the viewport width
    const updateSettings = () => {
      if (window.innerWidth < 480) {
        setSettings((prevSettings) => ({
          ...prevSettings,
          slidesToShow: 2,
          arrows: false,
        }));
      } else if (window.innerWidth < 769) {
        setSettings((prevSettings) => ({
          ...prevSettings,
          slidesToShow: 4,
          arrows: false,
        }));
      } else if (window.innerWidth < 1919) {
        setSettings((prevSettings) => ({
          ...prevSettings,
          slidesToShow: 4,
          arrows: true,
        }));
      } else {
        setSettings((prevSettings) => ({
          ...prevSettings,
          slidesToShow: 5,
          arrows: true,
        }));
      }
      if (friends.length <= settings.slidesToShow) {
        setSettings((prevSettings) => ({
          ...prevSettings,
          swipe: false,
          draggable: false,
        }));
      }
    };

    // Initial settings update
    updateSettings();

    // Update settings on resize
    window.addEventListener("resize", updateSettings);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", updateSettings);
    };
  }, []);

  return (
    <Slider {...settings}>
      {friends.length > 0 ? (
        friends.map((friend) => (
          <Card
            friends={friend}
            handleAddFriend={handleAddFriend}
            key={friend.id}
          />
        ))
      ) : (
        <div>No friends available</div>
      )}
    </Slider>
  );
}

export default Carousel;
