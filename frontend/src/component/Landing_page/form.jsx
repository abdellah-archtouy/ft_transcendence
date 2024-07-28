import React, { useState } from 'react';
import logo_42 from "./images/42_logo.svg";


const AuthForm = () => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <>
            <form action="" className='login_form'>
                <div className='login-form-div1'>
                    <p className='login_form-p1'>Sign up</p>
                    <h1 className='login_form-h1'>Welcome</h1>
                    <p className='login_form-p2'>Welcome back! Please enter your details</p>
                </div>
                <input
                    className='login_form-email'
                    type="email"
                    placeholder="Email"
                />
                <div className='password-container'>
                    <input className='login_form-password' type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" className='show-password-button' onClick={toggleShowPassword}>
                        {showPassword ? "Hide" : "Show"}
                    </button>
                </div>
                <a className='login_form-forget-password' href="">Forgot Password?</a>
                <button className='login_form-submit button-design' type="submit">Login</button>
                <button className='login_form-42-login button-design'>
                    <img src={logo_42} alt="" className='login_form-42-login-image' />
                    <p className='login_form-42-login-p'>Login with 42</p>
                </button>
                <p className='login_form-signup'>Don't have an account? <a href="">Sign up now</a></p>
            </form>
        </>
    );
};

export default AuthForm;
