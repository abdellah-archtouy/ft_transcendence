import React, { useState, useEffect } from 'react';
import logo_42 from "./images/42_logo.svg";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthForm = ({setShowPopup , handleLogin}) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [isOtpRequired, setIsOtpRequired] = useState(false);
    const [otp, setOtp] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleToggleForm = (event) => {
        event.preventDefault();
        setIsSignUp(!isSignUp);
        setErrors({});
        setShowPopup(false);
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

    const handleLoginOrSignup = async (event) => {
        event.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length === 0) {

            const data = isSignUp ? { username, email, password } : { email, password };
            const url = isSignUp ? 'http://localhost:8000/api/users/signup/' : 'http://localhost:8000/api/users/login/';

            try {
                const response = await axios.post(url, data);
                if (!isSignUp) {
                    // Assuming the backend responds with an OTP required status
                    setIsOtpRequired(true); // Show OTP form
                } else {
                    setShowPopup(true);
                    setTimeout(() => {
                        setIsSignUp(false);
                        setShowPopup(false);
                    }, 2000);
                }
            } catch (error) {
                if (error.response && error.response.data) {
                    const newErrors = {};
                    if (error.response.data.username) {
                        newErrors.username = 'Already in use';
                        setUsername(''); // Clear the username field
                    }
                    if (error.response.data.email) {
                        newErrors.email = 'Already in use';
                        setEmail(''); // Clear the email field
                    }
                    if (error.response.data.password) {
                        newErrors.password = error.response.data.password; // Use specific password error
                        setPassword(''); // Clear the password field
                    }
                    if (error.response.data) {
                        newErrors.email = 'Invalid';
                        newErrors.password = 'Invalid';
                        setEmail(''); // Clear the email field
                        setPassword(''); // Clear the password field
                    }
                    setErrors(newErrors);
                }
            }
        } else {
            setErrors(formErrors);
        }
    };

    const handleOtpSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post('http://localhost:8000/api/users/verify-otp/', { otp, email });
            console.log('OTP verified successfully');
            const { access, refresh } = response.data;
            localStorage.setItem('access', access);
            localStorage.setItem('refresh', refresh);
            handleLogin(access);
            navigate('/');
        } catch (error) {
            if (error.response && error.response.data) {
                const newErrors = {};
                newErrors.otp = 'Invalid OTP';
                setErrors(newErrors);
                console.log(errors.otp);
            } else {
                // Handle unexpected errors
                setErrors({ general: 'An unexpected error occurred. Please try again.' });
            }
        }
    };

    const handleChange = (setter) => (event) => {
        setter(event.target.value);
        setErrors(prevErrors => ({ ...prevErrors, [event.target.name]: '' })); // Clear the error for this field
    };

    const handle42Login = async () => {
        console.log("42 login function called");
    
        const redirectUri = encodeURIComponent('http://localhost:3000/api/auth/callback/');
        const clientId = 'u-s4t2ud-ec33d59c683704986dda31fd1812c016474dd371e1bea3233a32976cf6b14b5c'; // Replace with your actual client ID
        const url = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
    
        // Redirect user to 42 login page
        window.location.href = url;
    };

    useEffect(() => {
        console.log("this part has beeen trigered");
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            // Call the backend to exchange the code for tokens
            const fetchTokens = async () => {
                try {
                    const response = await axios.get(`http://localhost:8000/api/auth/callback/?code=${code}`);
                    const { access, refresh } = response.data;

                    // Save tokens in local storage
                    localStorage.setItem('access', access);
                    localStorage.setItem('refresh', refresh);
                    handleLogin(access);  // Call handleLogin with the access token
                    // navigate('/'); // Navigate to the home page or desired page
                    console.log("these tokens has been catched successfuly : ", access, refresh);
                } catch (error) {
                    console.error("Error fetching tokens: ", error);
                }
            };
            fetchTokens();
        }
    }, [handleLogin]);

    return (
        <>
            <form action="" className={`login_form ${isOtpRequired ? 'otp-form' : ''}`} onSubmit={isOtpRequired ? handleOtpSubmit : handleLoginOrSignup}>
                <div className='login-form-div1'>
                    <p className='login_form-p1'>{isOtpRequired ? 'OTP Verification' : (isSignUp ? 'Sign up' : 'Login')}</p>
                    <h1 className='login_form-h1'>{isOtpRequired ? 'Enter OTP' : (isSignUp ? 'Welcome' : 'Welcome back')}</h1>
                    <p className='login_form-p2'>{isOtpRequired ? 'Check your email for the OTP' : (isSignUp ? 'Create an account to get started' : 'Please enter your details')}</p>
                </div>

                {!isOtpRequired ? (
                    <>
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
                    </>
                ) : (
                    <input
                        className={`login_form-otp ${errors.otp ? 'input-error' : ''}`}
                        type="text"
                        name="otp"
                        placeholder={errors.otp || "Enter OTP"}
                        value={otp}
                        onChange={handleChange(setOtp)}
                    />
                )}

                {!isOtpRequired && <a className='login_form-forget-password' href="">Forgot Password?</a>}

                <button className='login_form-submit button-design' type="submit">
                    {isOtpRequired ? 'Verify OTP' : (isSignUp ? 'Sign Up' : 'Login')}
                </button>

                {!isOtpRequired && (
                    <>
                        <button className='login_form-42-login button-design' onClick={handle42Login}>
                            <img src={logo_42} alt="42 Logo" className='login_form-42-login-image' />
                            <p className='login_form-42-login-p'>Login with 42</p>
                        </button>
                        <p className='login_form-signup'>
                            {isSignUp ? "Already have an account? " : "Don't have an account? "}
                            <a href="" onClick={handleToggleForm}>
                                {isSignUp ? 'Login' : 'Sign up now'}
                            </a>
                        </p>
                    </>
                )}
            </form>
        </>
    );
};

export default AuthForm;
