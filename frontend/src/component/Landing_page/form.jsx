import React, { useState } from 'react';
import logo_42 from "./images/42_logo.svg";

const AuthForm = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleToggleForm = (event) => {
        event.preventDefault();
        setIsSignUp(!isSignUp);
    };

    return (
        <>
            <form action="" className='login_form'>
                <div className='login-form-div1'>
                    <p className='login_form-p1'>{isSignUp ? 'Sign up' : 'Login'}</p>
                    <h1 className='login_form-h1'>{isSignUp ? 'Welcome' : 'Welcome back'}</h1>
                    <p className='login_form-p2'>{isSignUp ? 'Create an account to get started' : 'Please enter your details'}</p>
                </div>
                {isSignUp && (
                    <input
                        className='login_form-username'
                        type="text"
                        placeholder="Username"
                    />
                )}
                <input
                    className='login_form-email'
                    type="email"
                    placeholder="Email"
                />
                <div className='password-container'>
                    <input
                        className='login_form-password'
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" className='show-password-button' onClick={toggleShowPassword}>
                        {showPassword ? "Hide" : "Show"}
                    </button>
                </div>
                <a className='login_form-forget-password' href="">Forgot Password?</a>
                <button className='login_form-submit button-design' type="submit">
                    {isSignUp ? 'Sign Up' : 'Login'}
                </button>
                <button className='login_form-42-login button-design'>
                    <img src={logo_42} alt="42 Logo" className='login_form-42-login-image' />
                    <p className='login_form-42-login-p'>Login with 42</p>
                </button>
                <p className='login_form-signup'>
                    {isSignUp ? "Already have an account? " : "Don't have an account? "}
                    <a href="" onClick={handleToggleForm}>
                        {isSignUp ? 'Login' : 'Sign up now'}
                    </a>
                </p>
            </form>
        </>
    );
};

export default AuthForm;

