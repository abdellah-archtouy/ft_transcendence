import React, { useState, useRef, useEffect } from 'react';
import "./styles/root.css";
import AuthForm from './form';
import table from "./images/floating_table.svg";

const Landing_page = ({ setAuth }) => {
    const [showPopup, setShowPopup] = useState(false);
    return (
        <div className="page-container">
            <div className={`popup ${showPopup ? 'show' : ''}`}>
                <p className='popup-p'>Account created successfully!</p>
            </div>
            <div className="table-container">
                <img src={table} alt="" className='table' />
            </div>
            <div className="form-container">
                <AuthForm setShowPopup={setShowPopup} handleLogin={setAuth} />
            </div>
        </div>
    );
};

export default Landing_page;
