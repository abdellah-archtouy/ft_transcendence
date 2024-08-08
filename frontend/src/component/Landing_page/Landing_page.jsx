import React, { useState, useRef, useEffect } from 'react';
import "./styles/section_1.css";
import "./styles/section_2.css";
import "./styles/section_3.css";
import "./styles/root.css";
import "./styles/footer.css";
import center from "./images/Center_image.svg";
import logo from "./../../icons/logo.svg";
import polygon from "./images/section1_Polygon.svg";
import square from "./images/section1_Square.svg";
import cross from "./images/section1_Cross.svg";
import circle from "./images/section1_Circle.svg";
import game from "./images/section2_Game.svg";
import star_dust from "./images/Star_dust.svg";
import lines from "./images/lines.svg";
import AuthForm from './form';
import table from "./images/floating_table.svg";
import linkedin_logo from "./images/linkedin_logo.svg";
import github_logo from "./images/github_logo.svg";
import instagram_logo from "./images/instagram_logo.svg";


const Landing_page = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if (menuOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
    }, [menuOpen]);

    useEffect(() => {
        const handleScroll = () => {
            // Show the scroll button when the user scrolls down 100px
            if (window.scrollY > 100) {
                setShowScrollButton(true);
            } else {
                setShowScrollButton(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const toggleMenu = () => {
        setMenuOpen(prev => !prev);
    };

    const handleMenuClick = (sectionId) => {
        setMenuOpen(false);
        document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };


    return (
        <div className="page-container">
            <img src={logo} alt="" className="logo" />
            {menuOpen && <div className="overlay"></div>}
            <a className="menu-toggle" onClick={() => {
                if (menuOpen == false)
                    toggleMenu();
            }}>
                Menu
            </a>
            <div className={`menu ${menuOpen ? 'open' : ''}`} ref={menuRef}>
                <ul>
                    <li onClick={() => handleMenuClick('home')}>Home</li>
                    <li onClick={() => handleMenuClick('how-to-play')}>How To Play</li>
                    <li onClick={() => handleMenuClick('login')}>Login</li>
                </ul>
                <span className='close-menu' onClick={toggleMenu}>Close</span>
            </div>
            <button
                className={`scroll-to-top ${showScrollButton ? 'show' : ''}`}
                onClick={scrollToTop}
            >
                ↑
            </button>
            <section className="landing_section_1" id="home">
                <div className='landing_section_1-polygon-div'>
                    <img src={polygon} alt="" className='polygon' />
                </div>
                <div className='landing_section_1-square-div'>
                    <img src={square} alt="" className='square' />
                </div>
                <div className='landing_section_1-cross-div'>
                    <img src={cross} alt="" className='cross' />
                </div>
                <div className='landing_section_1-circle-div'>
                    <img src={circle} alt="" className='circle' />
                </div>
                <div className='landing_section_1-container'>
                    <img src={center} alt="" className='center_image' />
                </div>
                <div className='scroll-down'>
                    <p>Scroll To Explore</p>
                </div>
                <div className="scroll-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12 21l-12-12h24L12 21z" />
                    </svg>
                </div>

            </section>
            <section className="landing_section_2" id="how-to-play">
                <div className='landing_section_2-square1-div'>
                    <img src={square} alt="" className='square1' />
                </div>
                <div className='landing_section_2-cross-div'>
                    <img src={cross} alt="" className='cross' />
                </div>
                <div className='landing_section_2-square2-div'>
                    <img src={square} alt="" className='square2' />
                </div>
                <div className='landing_section_2-polygon-div'>
                    <img src={polygon} alt="" className='polygon' />
                </div>
                <div className='landing_section_2-star-dust'>
                    <img src={star_dust} alt="" className='star_dust' />
                </div>
                <div className='landing_section_2-lines'>
                    <img src={lines} alt="" className='lines' />
                </div>
                {/* container for the texts */}
                <div className='landing_section_2-container'>
                    <div className='landing_section_2-container-guide-text'>
                        <h1 className='landing_section_2-container-h1'>How To Play</h1>
                        <h3 className='landing_section_2-container-h3'>Complete Guide</h3>
                        <p className='landing_section_2-container-text'>
                            Welcome to our online ping pong game! Use the up and down
                            arrows or 'W' and 'S' keys to control your paddle. Challenge friends
                            or play against the computer for fast-paced fun. Get ready to
                            smash your way to victory!
                        </p>
                    </div>
                    <div className='landing_section_2-container-guide-image'>
                        <img src={game} alt="" className='game_image' />
                    </div>
                </div>
            </section>
            <section className="landing_section_3" id="login">
                <div className='landing_section_3-circle'>
                    <img src={circle} alt="" className='circle' />
                </div>
                <div className='landing_section_3-cross'>
                    <img src={cross} alt="" className='cross' />
                </div>
                <div className='landing_section_3-container'>
                    <div className='landing_section_3-container-form'>
                        <AuthForm />
                    </div>
                    {/* making the floating table animation */}
                    <div className='landing_section_3-container-table-animation'>
                        <img src={table} alt="" className='table' />
                    </div>
                </div>
            </section>
            <section className="footer">
                <div className='footer-div'>
                    <ul className='info'>
                        <li className='list-heading'><h1>Contact@msg.com</h1></li>
                        <li className='list-info'>1337 Khouribga </li>
                        <li className='list-info'>32.882163, -6.897713</li>
                        <li className='list-info'>Mail Central, Mine verte</li>
                        <li className='list-heading-3'><h3>Privacy Policy</h3></li>
                    </ul>
                    <ul className='about'>
                        <h1 className='list-heading'>About</h1>
                        <li className='about-links'><a href='#home'>Home</a></li>
                        <li className='about-links'><a href='#how-to-play'>How to Play</a></li>
                        <li className='about-links'><a href='#login'>Log in</a></li>
                        <li className='about-links'><a href='#sign-up'>Sign up</a></li>
                    </ul>
                    <ul className='media'>
                        <h1 className='list-heading'>Media</h1>
                        <li className='social_links'><img src={linkedin_logo} alt='linkedin_small_logo' /><a href=''>Linkedin</a></li>
                        <li className='social_links'><img src={github_logo} alt='github_small_logo' /><a href=''>Github</a></li>
                        <li className='social_links'><img src={instagram_logo} alt='instagram_small_logo' /><a href=''>Instagram</a></li>
                    </ul>

                </div>
            </section>
        </div>
    );
};

export default Landing_page;
