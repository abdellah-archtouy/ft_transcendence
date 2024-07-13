import Slider from "react-slick";
import Card from "./Card.jsx";


function Carousel({ friends, handleAddFriend }) {

    var settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1,
        initialSlide: 0,
    };

    return (
        <Slider {...settings}>
            {friends.map((friend) => (
                <Card friends={friend} handleAddFriend={handleAddFriend} key={friend.id} />
            ))}
        </Slider>
    );
}

export default Carousel;
