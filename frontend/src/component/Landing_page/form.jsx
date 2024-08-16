import React, { useState } from 'react';
import logo_42 from "./images/42_logo.svg";

const AuthForm = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleToggleForm = (event) => {
        event.preventDefault();
        setIsSignUp(!isSignUp);
        setErrors({});
    };

    const validateForm = () => {
        const newErrors = {};

        if (isSignUp) {
            if (!username) {
                newErrors.username = 'Required';
            } else if (username.length < 3 || username.length > 15) {
                newErrors.username = '3-15 chars';
                setUsername(''); // Clear input
            } else if (!/^[a-zA-Z0-9]+$/.test(username)) {
                newErrors.username = 'Alphanumeric';
                setUsername(''); // Clear input
            }
        }

        if (!email) {
            newErrors.email = 'Required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Invalid';
            setEmail(''); // Clear input
        }

        if (!password) {
            newErrors.password = 'Required';
        } else if (password.length < 8) {
            newErrors.password = '8+ chars';
            setPassword(''); // Clear input
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password)) {
            newErrors.password = 'Low Complexity';
            setPassword(''); // Clear input
        }

        return newErrors;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length === 0) {
            // Submit the form (e.g., send the data to the server)
        } else {
            setErrors(formErrors);
        }
    };

    const handleChange = (setter) => (event) => {
        setter(event.target.value);
        setErrors(prevErrors => ({ ...prevErrors, [event.target.name]: '' })); // Clear the error for this field
    };

    return (
        <>
            <form action="" className='login_form' onSubmit={handleSubmit}>
                <div className='login-form-div1'>
                    <p className='login_form-p1'>{isSignUp ? 'Sign up' : 'Login'}</p>
                    <h1 className='login_form-h1'>{isSignUp ? 'Welcome' : 'Welcome back'}</h1>
                    <p className='login_form-p2'>{isSignUp ? 'Create an account to get started' : 'Please enter your details'}</p>
                </div>
                {isSignUp && (
                    <input
                        className={`login_form-username ${errors.username ? 'input-error' : ''}`}
                        type="text"
                        name="username"
                        placeholder={errors.username || "Username"}
                        value={username}
                        onChange={handleChange(setUsername)}
                    />
                )}
                <input
                    className={`login_form-email ${errors.email ? 'input-error' : ''}`}
                    type="email"
                    name="email"
                    placeholder={errors.email || "Email"}
                    value={email}
                    onChange={handleChange(setEmail)}
                />
                <div className='password-container'>
                    <input
                        className={`login_form-password ${errors.password ? 'input-error' : ''}`}
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder={errors.password || "Password"}
                        value={password}
                        onChange={handleChange(setPassword)}
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
