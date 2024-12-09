import React, { useState, useRef, useEffect } from 'react';
import "./styles/root.css";
import AuthForm from './form';
import table from "./images/floating_table.svg";

const apiUrl = process.env.REACT_APP_API_URL;

const Landing_page = ({ setAuth }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(false);
    console.log(apiUrl)
    return (
        <div className="page-container">
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">Authenticating...</p>
                </div>
            )}
            <div className={`popup ${showPopup ? 'show' : ''}`}>
                <p className='popup-p'>Account created successfully!</p>
            </div>
            <div className="table-container">
                <img src={table} alt="" className='table' />
            </div>
            <div className="form-container">
                <AuthForm setShowPopup={setShowPopup} handleLogin={setAuth} setLoading={setLoading} />
            </div>
        </div>
    );
};

export default Landing_page;
