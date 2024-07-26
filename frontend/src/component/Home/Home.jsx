import React from 'react';
import Carousel from './Carousel.jsx';
import Stats from './Stats.jsx';
import Top_5 from './Top-5.jsx';
import './styles/Home.css';
import './styles/Top-5.css';
import './styles/Suggestions.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

//this is just for the demo obviously the data will be fetched from the server in real world scenario !!
import profile1 from './images/profile1.jpg';
import profile2 from './images/profile2.jpg';
import profile3 from './images/profile3.jpg';
import profile4 from './images/profile4.jpg';
import profile5 from './images/profile5.jpg';
import profile6 from './images/profile6.jpg';
import profile7 from './images/profile7.jpg';
import profile8 from './images/profile8.jpg';


const Home = () => {
  console.log('profile1', profile1);
  const friends = [
    { name: 'John Does shmoew pipipopo', online: true, id: 1, img: profile1 },
    { name: 'Jane Doe', online: false, id: 2, img: profile2 },
    { name: 'Jill Doe', online: true, id: 3, img: profile3 },
    { name: 'Jack Doe', online: false, id: 4, img: profile4 },
    { name: 'Jim Doe', online: true, id: 5, img: profile5 },
    { name: 'Jenny Doe', online: false, id: 6, img: profile6 },
    { name: 'Jen Doe', online: true, id: 7, img: profile7 },
    { name: 'Jenifer Doe', online: false, id: 8, img: profile8 },
  ];

  let handleAddFriend = () => {
    console.log('Friend added');
  }

  return (
    <div className='home-div'>
      <div className="home-dive-welcome">
        <h2>Hello, Talal</h2>
        <p>Welcome back to our game</p>
        <button className='home-dive-welcome-btn'>Play now</button>
      </div>
      <div className="suggestions">
        <div className='header_element'>
          <h3>Suggested for you</h3>
        </div>
        <div className="slide-elements">
          <Carousel friends={friends} handleAddFriend={handleAddFriend} />
        </div>
      </div>
      <div className="stats">
        <div className="last-matches">
          <div className='last-matches-header'>
            <h2>Last matches</h2>
            <div>
              <a href="">see more</a>
            </div>
          </div>
          <div className="last-matches-stats">
            <Stats />
          </div>
        </div>
        <div className="top-5">
          <div className='top-5-header'>
            <h2>Top 5</h2>
            <div>
              <a href="">see more</a>
            </div>
          </div>
          <div className="top-5-stats">
            <Top_5 />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

