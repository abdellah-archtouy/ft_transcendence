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
  const [isFadingOut, setIsFadingOut] = React.useState(false);
  const navigate = useNavigate();

  function avatarUrl(avatar) {
    return `http://localhost:8000${avatar}`;
  }

  function coverUrl(cover) {
    console.log(cover)
    return `http://localhost:8000${cover}`;
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const access = localStorage.getItem("access");

        const response = await axios.get(`${apiUrl}/api/users/profile/`, {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        });

        setUser(response.data);
        setUsername(response.data.username); // Populate username
        setBio(response.data.bio);
        console.log(response.data);
      } catch (error) {
        handleFetchError(error);
      }
    };

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
              .catch((refreshError) => {
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                console.log("you have captured the error");
                setErrors({ general: "Session expired. Please log in again." });
                // refreh the page
                window.location.reload();
                navigate("/");
              });
          } else {
            setErrors({
              general: "No refresh token available. Please log in.",
            });
          }
        } else {
          setErrors({ general: "Error fetching data. Please try again." });
        }
      } else {
        setErrors({
          general: "An unexpected error occurred. Please try again.",
        });
      }
    };
    fetchUserData();
  }, []);

  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    // API call to update general info (username, bio)
    // Example: POST to `/api/users/update-info/`
    console.log("Updating general info:", { username, bio });
  };

  // Handle security form submission (Passwords)
  const handleSecuritySubmit = (e) => {
    e.preventDefault();
    if (newPassword !== retypePassword) {
      setErrors({ security: "New passwords do not match." });
      return;
    }
    // API call to update password
    // Example: POST to `/api/users/change-password/`
    console.log("Changing password:", { currentPassword, newPassword });
  };

  if (!user) {
    return <LoadingPage />;
  }

  const handlechangeForm = () => {
    setGeneral(!general);
  };

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
            <p className="cover-change_p">Change Cover</p>
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
              onClick={() => handlechangeForm()}
            >
              General
            </button>
            <button
              className={
                general
                  ? "settings-forms-btn "
                  : "settings-forms-btn active-btn"
              }
              onClick={() => handlechangeForm()}
            >
              Security
            </button>
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
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="bio">Bio:</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="form-input-bio"
                  />
                </div>
                <button type="submit" className="form-submit-btn">
                  Save
                </button>
              </form>
            ) : (
              <form
                onSubmit={handleSecuritySubmit}
                className={"form-security"}
                key="security-form"
              >
                <div className="form-group">
                  <label htmlFor="current-password">Change Password:</label>
                  <input
                    type="text"
                    id="current-password"
                    name="current-password"
                    value={currentPassword}
                    placeholder="Current Password"
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="form-input"
                  />
                  <input
                    type="text"
                    id="new-password"
                    name="new-password"
                    value={newPassword}
                    placeholder="New Password"
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                  />
                  <input
                    type="text"
                    id="retype-password"
                    name="retype-password"
                    value={retypePassword}
                    placeholder="Retype Password"
                    onChange={(e) => setRetypePassword(e.target.value)}
                    className="form-input"
                  />
                </div>

                <button type="submit" className="form-submit-btn">
                  Save
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;
