import React, { useState, useEffect } from "react";
import logo_42 from "./images/42_logo.svg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import check from "./images/Vector.svg";

const AuthForm = ({ setShowPopup, handleLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isOtpRequired, setIsOtpRequired] = useState(false);
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [countdown, setCountdown] = useState(60); // For OTP resend countdown
  const [canResend, setCanResend] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
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
        newErrors.username = "Required";
      } else if (username.length < 3 || username.length > 15) {
        newErrors.username = "3-15 chars";
        setUsername(""); // Clear input
      } else if (!/^[a-zA-Z0-9]+$/.test(username)) {
        newErrors.username = "Alphanumeric";
        setUsername(""); // Clear input
      }
    }

    if (!email) {
      newErrors.email = "Required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid";
      setEmail(""); // Clear input
    }

    if (!isForgotPassword && !password) {
      newErrors.password = "Required";
    } else if (!isForgotPassword && password.length < 8) {
      newErrors.password = "8+ chars";
      setPassword(""); // Clear input
    } else if (
      !isForgotPassword &&
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password)
    ) {
      newErrors.password = "Low Complexity";
      setPassword(""); // Clear input
    }

    return newErrors;
  };

  const handleLoginOrSignup = async (event) => {
    event.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length === 0) {
      const data = isSignUp
        ? { username, email, password }
        : { email, password };
      const url = isSignUp
        ? "http://localhost:8000/api/users/signup/"
        : "http://localhost:8000/api/users/login/";

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
            newErrors.username = "Already in use";
            setUsername(""); // Clear the username field
          }
          if (error.response.data.email) {
            newErrors.email = "Already in use";
            setEmail(""); // Clear the email field
          }
          if (error.response.data.password) {
            newErrors.password = error.response.data.password; // Use specific password error
            setPassword(""); // Clear the password field
          }
          if (error.response.data) {
            newErrors.email = "Invalid";
            newErrors.password = "Invalid";
            setEmail(""); // Clear the email field
            setPassword(""); // Clear the password field
          }
          setErrors(newErrors);
        }
      }
    } else {
      setErrors(formErrors);
    }
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    const formErrors = validateForm();
    if (!formErrors.email) {
      try {
        await axios.post("http://localhost:8000/api/users/forgot-password/", {
          email,
        });
        setIsForgotPassword(false);
      } catch (error) {
        setErrors({ email: "Error sending reset email." });
      }
    } else {
      setErrors(formErrors);
    }
  };

  const handleOtpSubmit = async (event) => {
    event.preventDefault();
    const otpString = otp.join(""); // Combine all OTP fields into a single string

    try {
      const response = await axios.post(
        "http://localhost:8000/api/users/verify-otp/",
        { otp: otpString, email }
      );
      const { access, refresh } = response.data;
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      handleLogin(access);
      navigate("/");
    } catch (error) {
      const newErrors = {};
      if (error.response && error.response.data) {
        newErrors.otp = "Invalid OTP";
        setErrors(newErrors);
      } else {
        setErrors({
          general: "An unexpected error occurred. Please try again.",
        });
      }
    }
  };

  // handle resending the otp code

  useEffect(() => {
    let timer;
    if (isOtpRequired && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true); // Enable resend button when countdown finishes
    }

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, [isOtpRequired, countdown]);

  const handleResendOtp = async (event) => {
    event.preventDefault();
    if (!canResend) return;

    try {
      // Call API to resend OTP
      await axios.post("http://localhost:8000/api/users/resend-otp/", {
        email,
      });
      setCountdown(60); // Restart countdown
      setCanResend(false); // Disable resend button
    } catch (error) {
      setErrors({ otp: "Error resending OTP. Try again later." });
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return; // Ensure input is numeric

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Move to next input if it's not the last one and current input is not empty
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move focus to the previous input on backspace if current is empty
      e.target.previousSibling.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").split("");

    const newOtp = [...otp];
    pasteData.forEach((char, i) => {
      if (i < otp.length && !isNaN(char)) {
        newOtp[i] = char;
      }
    });
    setOtp(newOtp);

    // Focus on the last filled input
    const lastIndex = pasteData.length - 1;
    if (lastIndex < otp.length) {
      document.querySelectorAll(".otp-input")[lastIndex].focus();
    }
  };

  const handleChange = (setter) => (event) => {
    setter(event.target.value);
    setErrors((prevErrors) => ({ ...prevErrors, [event.target.name]: "" })); // Clear the error for this field
  };

  const handle42Login = async () => {
    console.log("42 login function called");

    const redirectUri = encodeURIComponent(
      "http://localhost:3000/api/auth/callback/"
    );
    const clientId =
      "u-s4t2ud-ec33d59c683704986dda31fd1812c016474dd371e1bea3233a32976cf6b14b5c"; // Replace with your actual client ID
    const url = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;

    // Redirect user to 42 login page
    window.location.href = url;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      // Call the backend to exchange the code for tokens
      const fetchTokens = async () => {
        try {
          const response = await axios.get(
            `http://localhost:8000/api/auth/callback/?code=${code}`
          );
          const { access, refresh } = response.data;

          // Save tokens in local storage
          localStorage.setItem("access", access);
          localStorage.setItem("refresh", refresh);
          handleLogin(access, refresh); // Call handleLogin with the access token
          navigate("/"); // Navigate to the home page or desired page
        } catch (error) {
          console.error("Error fetching tokens: ", error);
        }
      };
      fetchTokens();
    }
  }, [handleLogin]);

  return (
    <>
      <form
        action=""
        className={`login_form ${isOtpRequired ? "otp-form" : ""}`}
        onSubmit={
          isOtpRequired
            ? handleOtpSubmit
            : isForgotPassword
            ? handleForgotPassword
            : handleLoginOrSignup
        }
      >
        {/* add a close icon when in resenting password */}
        {isForgotPassword && (
          <div className="isForgotPassword-close-container">
            <button
              className="isForgotPassword-close"
              onClick={() => setIsForgotPassword(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="close-otp"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {isOtpRequired && (
          <div className="design-top-form">
            <div className="design-top-form-1">
              <button
                className="login_form-close"
                onClick={() => setIsOtpRequired(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="close-otp"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="design-top-form-2">
              <img src={check} alt="check" className="check-image" />
            </div>
          </div>
        )}
        <div
          className={isOtpRequired ? "login-form-div1-otp" : "login-form-div1"}
        >
          <p className={!isOtpRequired ? "login_form-p1" : "login_form-p1-otp"}>
            {isForgotPassword
              ? "Forgot Password"
              : isOtpRequired
              ? "OTP Verification"
              : isSignUp
              ? "Sign up"
              : "Login"}
          </p>
          <h1
            className={!isOtpRequired ? "login_form-h1" : "login_form-h1-otp"}
          >
            {isForgotPassword
              ? "Reset Password"
              : isOtpRequired
              ? "Enter your code"
              : isSignUp
              ? "Welcome"
              : "Welcome back"}
          </h1>
          <p className={!isOtpRequired ? "login_form-p2" : "login_form-p2-otp"}>
            {isForgotPassword
              ? "Please enter your email to receive reset instructions"
              : isOtpRequired
              ? "Check your email for the OTP"
              : isSignUp
              ? "Create an account to get started"
              : "Please enter your details"}
          </p>
        </div>
        {!isOtpRequired ? (
          <>
            {isSignUp && (
              <input
                className={`login_form-username ${
                  errors.username ? "input-error" : ""
                }`}
                type="text"
                name="username"
                placeholder={errors.username || "Username"}
                value={username}
                onChange={handleChange(setUsername)}
              />
            )}
            <input
              className={`login_form-email ${
                errors.email ? "input-error" : ""
              }`}
              type="email"
              name="email"
              placeholder={errors.email || "Email"}
              value={email}
              onChange={handleChange(setEmail)}
            />
            {!isForgotPassword && (
              <div className="password-container">
                <input
                  className={`login_form-password ${
                    errors.password ? "input-error" : ""
                  }`}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={errors.password || "Password"}
                  value={password}
                  onChange={handleChange(setPassword)}
                />
                <button
                  type="button"
                  className="show-password-button"
                  onClick={toggleShowPassword}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="otp-container">
            {otp.map((value, index) => (
              <input
                key={index}
                type="text"
                className={`otp-input ${errors.otp ? "input-error" : ""}`}
                maxLength="1"
                value={value}
                onChange={(e) => handleOtpChange(e.target, index)}
                onFocus={(e) => e.target.select()} // Select the input on focus
                onKeyDown={(e) => handleKeyDown(e, index)} // Handle key events like delete
                onPaste={(e) => handlePaste(e)} // Handle paste event
              />
            ))}
          </div>
        )}

        {/* add the resent otp */}
        {isOtpRequired && (
          <div className="login_form-resend-otp-container">
            <a
              className={`login_form-resend-otp ${
                !canResend ? "disabled" : ""
              }`}
              onClick={handleResendOtp}
              disabled={!canResend}
            >
              {canResend ? "Resend code" : `Resend in ${countdown}s`}
            </a>
          </div>
        )}

        {!isOtpRequired && !isForgotPassword && !isSignUp && (
          <div className="login_form-forget-password">
            <a
              className="login_form-forget-password-a"
              onClick={() => setIsForgotPassword(true)}
            >
              Forgot Password?
            </a>
          </div>
        )}

        {!isOtpRequired && (
          <button
            className={
              !isSignUp
                ? "login_form-submit button-design"
                : "login_form-submit-signup button-design"
            }
            type="submit"
          >
            {isSignUp
              ? "Sign Up"
              : !isForgotPassword
              ? "Login"
              : "Send Reset Email"}
          </button>
        )}

        {isOtpRequired && (
          <div className="otp-button-container">
            <button className="otp-submit" type="submit">
              Continue
            </button>
          </div>
        )}

        {!isOtpRequired && !isForgotPassword && (
          <>
            {!isSignUp && (
              <button
                className="login_form-42-login button-design"
                onClick={handle42Login}
                type="button"
              >
                <img
                  src={logo_42}
                  alt="42 Logo"
                  className="login_form-42-login-image"
                />
                <p className="login_form-42-login-p">Login with 42</p>
              </button>
            )}
            <p className="login_form-signup">
              {isSignUp
                ? "Already have an account? "
                : "Don't have an account? "}
              <a href="" onClick={handleToggleForm}>
                {isSignUp ? "Login" : "Sign up now"}
              </a>
            </p>
          </>
        )}
      </form>
    </>
  );
};

export default AuthForm;
