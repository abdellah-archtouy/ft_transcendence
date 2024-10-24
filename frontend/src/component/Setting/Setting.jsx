import React from "react";
import "./styles/root.css";
import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingPage from "../loadingPage/loadingPage";
import { useState } from "react";

const Setting = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [user, setUser] = React.useState(null);
  const [errors, setErrors] = React.useState({});
  const [general, setGeneral] = React.useState(true); // Toggles between General and Security
  const [username, setUsername] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [retypePassword, setRetypePassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [login42, setlogin42] = React.useState(false);
  const navigate = useNavigate();

  function avatarUrl(avatar) {
    return `http://localhost:8000${avatar}`;
  }

  function coverUrl(cover) {
    return `http://localhost:8000${cover}`;
  }


  const handleInputChange = (setter, errorField) => (e) => {
    setter(e.target.value);
    if (errors[errorField]) {
      // Remove error once user starts typing
      setErrors((prevErrors) => ({
        ...prevErrors,
        [errorField]: null,
      }));
    }
  };

  const fetchUserData = async () => {
    try {
      const access = localStorage.getItem("access");
      const response = await axios.get(`${apiUrl}/api/users/profile/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      setUser(response.data);
      setUsername(response.data.username);
      setBio(response.data.bio);
      if (response.data.email.includes("@student.1337.ma")) {
        setlogin42(true);
      }
    } catch (error) {
      handleFetchError(error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [apiUrl]);

  const validateGeneralForm = () => {
    const newErrors = {};
    
    if (!username) {
      newErrors.username = "Username is required.";
    } else if (username.length < 3 || username.length > 15) {
      newErrors.username = "Username must be 3-15 characters long.";
    } else if (!/^[a-zA-Z0-9-]+$/.test(username)) {
      newErrors.username = "Username can only contain letters, numbers, and hyphens.";
    }
  
    if (bio.length >= 150) {
      newErrors.bio = "Bio must be less than 150 characters.";
    }
  
    // check if username is changed and bio is changed
    if (username === user.username && bio === user.bio) {
      newErrors.general = "No changes detected.";
    }
  
    return newErrors;
  };
  

  const validateSecurityForm = () => {
    const newErrors = {};
  
    // check against empty values
    if (!currentPassword)
      newErrors.currentPassword = "Password is required.";
    if (!newPassword)
      newErrors.newPassword = "Password is required.";
    if (!retypePassword)
      newErrors.retypePassword = "Password is required.";

  
    // If there are no empty value errors, continue with complexity checks
    if (!newErrors.currentPassword && 
        (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(currentPassword) || currentPassword.length < 8)) {
      newErrors.currentPassword = "must be more complex.";
    }
  
    if (!newErrors.newPassword && 
        (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(newPassword) || newPassword.length < 8)) {
      newErrors.newPassword = "must be more complex.";
    }
  
    if (!newErrors.retypePassword && 
        (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(retypePassword) || retypePassword.length < 8)) {
      newErrors.retypePassword = "must be more complex.";
    }
  
    // check if the new password is the same as the current password
    if (!newErrors.newPassword && currentPassword === newPassword) {
      newErrors.newPassword = "New password must be different from current password.";
    }
  
    // check if retypePassword matches newPassword
    if (!newErrors.retypePassword && retypePassword !== newPassword) {
      newErrors.retypePassword = "Passwords do not match.";
    }
  
    return newErrors;
  };
  


  const handleGeneralSubmit = async () => {
    setLoading(true);
    const generalErrors = validateGeneralForm();
    if (Object.keys(generalErrors).length === 0) {
      console.log("General info updated successfully.");
      try {
        console.log("General info updated successfully.");
        const access = localStorage.getItem("access");
        // should submit usernamer and bio if they have been changed and bio exist atherwise should submit only username

          await axios.put(
            `${apiUrl}/api/users/update-general-info/`,
            { username, bio },
            {
              headers: { Authorization: `Bearer ${access}` },
            }
          );
        setLoading(false);
        console.log("General info updated successfully.");
      } catch (error) {
        setLoading(false);
        handleFetchError(error);
      }
    } else {
      setErrors(generalErrors);
      setLoading(false);
    }
  };

  const handleSecuritySubmit = async () => {
    setLoading(true);
    const securityErrors = validateSecurityForm();
    if (Object.keys(securityErrors).length === 0) {
      try {
        const access = localStorage.getItem("access");
        await axios.put(
          `${apiUrl}/api/users/change_password/`,
          { currentPassword, newPassword },
          {
            headers: { Authorization: `Bearer ${access}` },
          }
        );
        setLoading(false);
        console.log("Password changed successfully.");
      } catch (error) {
        setLoading(false);
        handleFetchError(error);
      }
    } else {
      setErrors(securityErrors);
      setLoading(false);
    }
  };




  const handleSubmit = (e) => {
    e.preventDefault();
    if (general) {
      handleGeneralSubmit();
    } else {
      handleSecuritySubmit();
    }
  };

  if (!user) {
    return <LoadingPage />;
  }

  const handleFetchError = (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        const refresh = localStorage.getItem("refresh");
        if (refresh) {
          axios
            .post(`${apiUrl}/api/token/refresh/`, { refresh })
            .then((refreshResponse) => {
              const { access: newAccess } = refreshResponse.data;
              localStorage.setItem("access", newAccess);
              fetchUserData(); // Retry fetching user data
            })
            .catch(() => {
              localStorage.removeItem("access");
              localStorage.removeItem("refresh");
              setErrors({ general: "Session expired. Please log in again." });
              window.location.reload();
              navigate("/");
            });
        } else {
          setErrors({ general: "No refresh token available. Please log in." });
        }
      } else {
        setErrors({ general: "Error fetching data. Please try again." });
      }
    } else {
      setErrors({ general: "An unexpected error occurred. Please try again." });
    }
  };

  const handlechangeGeneral = () => {
    // it should not change if the value is true
    setGeneral(true);
    setErrors({});
  };

  const handlechangeSecurity = () => {
    setGeneral(false);
    setErrors({});
  }

  return (
    <div className="settings-container">
      <div className="settings">
        <div className="settings-cover">
          <div
            className="user-cover"
            style={{ backgroundImage: `url(${coverUrl(user.cover)})` }}
          />
          <div className="user-avatar-container">
            <img className="user-avatar" src={avatarUrl(user.avatar)} alt="" />
            <button className="user-avatar-btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                className="user-avatar-btn-icon"
              >
                <path d="M149.1 64.8L138.7 96 64 96C28.7 96 0 124.7 0 160L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64l-74.7 0L362.9 64.8C356.4 45.2 338.1 32 317.4 32L194.6 32c-20.7 0-39 13.2-45.5 32.8zM256 192a96 96 0 1 1 0 192 96 96 0 1 1 0-192z" />
              </svg>
            </button>
          </div>
          <button className="cover-change_btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="cover-change_icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
              />
            </svg>
            <p className="cover-change_p">Change</p>
          </button>
        </div>
        <div className="settings-forms">
          <div className="settings-forms-btn-container">
            <button
              className={
                general
                  ? "settings-forms-btn  active-btn"
                  : "settings-forms-btn "
              }
              onClick={() => handlechangeGeneral()}
            >
              General
            </button>
            {login42 ? null : (
            <button
              className={
                general
                  ? "settings-forms-btn "
                  : "settings-forms-btn active-btn"
              }
              onClick={() => handlechangeSecurity()}
            >
              Security
            </button>
            )}
          </div>
          <span className="settings-form-seperator" />
          <div className="settings-forms-container">
          {general ? (
            <form
              onSubmit={handleGeneralSubmit}
              className={"form-general"}
              key="general-form"
            >
              <div className="form-group">
                <label htmlFor="username">Username:</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={username}
                  onChange={handleInputChange(setUsername, "username")}
                  className={`form-input ${errors.username ? "input-error shake" : ""}`}
                  placeholder={errors.username ? errors.username : ""}
                />
              </div>
              <div className="form-group">
                <label htmlFor="bio">Bio:</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={bio}
                  onChange={handleInputChange(setBio, "bio")}
                  className={`form-input-bio ${errors.bio ? "input-error shake" : ""}`}
                  placeholder={errors.bio ? errors.bio : ""}
                />
              </div>
            </form>
          ) : (
            <form
              onSubmit={handleSecuritySubmit}
              className={`form-security ${login42 ? 'form-security-42' : ''}`}
              key="security-form"
            >
              <div className="form-group">
                <label htmlFor="current-password">Current Password:</label>
                <input
                  type="text"
                  id="current-password"
                  name="current-password"
                  // it should show the error message if the password is incorrect
                  value={errors.currentPassword ? "" : currentPassword}
                  onChange={handleInputChange(setCurrentPassword, "currentPassword")}
                  className={`form-input ${errors.currentPassword ? "input-error shake" : ""}`}
                  placeholder={errors.currentPassword ? errors.currentPassword : "Current Password"}
                />
                <input
                  type="text"
                  id="new-password"
                  name="new-password"
                  value={errors.newPassword ? "" : newPassword}
                  onChange={handleInputChange(setNewPassword, "newPassword")}
                  className={`form-input ${errors.newPassword ? "input-error shake" : ""}`}
                  placeholder={errors.newPassword ? errors.newPassword : "New Password"}
                />
                <input
                  type="text"
                  id="retype-password"
                  name="retype-password"
                  value={errors.retypePassword ? "" : retypePassword}
                  onChange={handleInputChange(setRetypePassword, "retypePassword")}
                  className={`form-input ${errors.newPassword ? "input-error shake" : ""}`}
                  placeholder={errors.newPassword ? errors.newPassword : "Repeat New password"}
                />
              </div>
            </form>
          )}
          </div>
          <button onClick={handleSubmit} className="form-submit-btn">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Setting;
