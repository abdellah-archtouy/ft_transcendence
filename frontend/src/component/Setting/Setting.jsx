import React from "react";
import "./styles/root.css";
import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingPage from "../loadingPage/loadingPage";
import { useState } from "react";
import { useError } from "../../App";

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
  const [coverImagePreview, setCoverImagePreview] = useState(null); // To preview the cover image
  const [avatarPreview, setAvatarPreview] = useState(null); // To preview the avatar
  const [coverImageFile, setCoverImageFile] = useState(null); // To store the cover image file
  const [avatarImageFile, setAvatarImageFile] = useState(null); // To store the avatar image file
  const navigate = useNavigate();
  const { setError } = useError();

  function avatarUrl(avatar) {
    return `${apiUrl}${avatar}`;
  }

  function coverUrl(cover) {
    return `${apiUrl}${cover}`;
  }

  const handleFetchError = (error, retryFunction) => {
    if (error.response && error.response.status === 401) {
      const refresh = localStorage.getItem("refresh");

      if (refresh) {
        axios
          .post(`${apiUrl}/api/token/refresh/`, { refresh })
          .then((refreshResponse) => {
            const { access: newAccess } = refreshResponse.data;
            localStorage.setItem("access", newAccess);
            retryFunction();
          })
          .catch((refreshError) => {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            setErrors({ general: "Session expired. Please log in again." });
            window.location.reload();
            navigate("/");
          });
        } else {
          setErrors({ general: "No refresh token available. Please log in." });
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.reload();
          navigate("/");
      }
    } else {
      setErrors({ general: "An unexpected error occurred. Please try again." });
    }
  };


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
      handleFetchError(error, fetchUserData);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [apiUrl]);


  const handleCoverImageChange = () => {
    const newErrors = {};
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none'; // Hide the file input

    // Trigger file input click when button is clicked
    fileInput.click();

    // When a file is selected, update preview and handle the upload
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        // Check if the file is an image
        if (!file.type.startsWith('image/')) {
          newErrors.general = 'Please select a valid image file.';
          return;
        }

        const img = new Image();
        const reader = new FileReader();

        reader.onloadend = () => {
          img.src = reader.result;

          img.onload = () => {
            // Check for 16:9 aspect ratio
            const aspectRatio = img.width / img.height;
            if (aspectRatio < 1.77 || aspectRatio > 1.79) {
              newErrors.cover = 'Image must have a 16:9 aspect ratio.';
              setError('Cover image must have a 16:9 aspect ratio.');
              return;
            }

            // Check if the image resolution is within the 1920x1080 range
            if (img.width < 1920 || img.height < 1080 || img.width > 1920 || img.height > 1080) {
              newErrors.cover = 'Image resolution must be 1920x1080 pixels.';
              setError('Cover image resolution must be 1920x1080 pixels.');
              return;
            }

            // Optional: Check file size (e.g., 5MB max size for cover images)
            const maxFileSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxFileSize) {
              newErrors.cover = 'Cover image file size must not exceed 5MB.';
              setError('Cover image file size must not exceed 5MB.');
              return;
            }

            // If everything is valid, set preview and file
            setCoverImagePreview(reader.result);
            setCoverImageFile(file);
          };

          img.onerror = () => {
            newErrors.cover = 'An error occurred while processing the image.';
            console.error('Error processing image.');
          };
        };

        reader.readAsDataURL(file); // Read file as base64 for preview
      }
    });
  };

  const handleAvatarImageChange = () => {
    const newErrors = {};
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none'; // Hide the file input

    // Trigger file input click when button is clicked
    fileInput.click();

    // When a file is selected, update preview and handle the upload
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        // Check if the file is an image
        if (!file.type.startsWith('image/')) {
          setErrors({ general: 'Please select a valid image file.' });
          return;
        }
        const img = new Image();
        const reader = new FileReader();

        reader.onloadend = () => {
          img.src = reader.result;

          img.onload = () => {
            if (img.width !== img.height) {
              newErrors.avatar = 'Image must have a 1:1 aspect ratio.';
              setError('Avatar image must have a 1:1 aspect ratio.');
              return;
            }
            if (img.width < 500 || img.height < 500 || img.width > 800 || img.height > 800) {
              newErrors.avatar = 'Image resolution must be between 500x500 and 800x800 pixels.';
              setError('between 500x500 and 800x800 pixels.');
              return;
            }

            const maxFileSize = 2 * 1024 * 1024; // 2MB max size
            if (file.size > maxFileSize) {
              newErrors.avatar = 'Image file size must not exceed 2MB.';
              setError('Avatar image file size must not exceed 2MB.');
              return;
            }

            setAvatarPreview(reader.result);
            setAvatarImageFile(file);
          };

          img.onerror = () => {
            newErrors.avatar = 'An error occurred while processing the image.';
          };
        };
        reader.readAsDataURL(file);
      }
    });

    console.log(avatarImageFile);
  };



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
    if (username === user.username && bio === user.bio && !coverImageFile && !avatarImageFile) {
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
      newErrors.newPassword = "must be different from current password.";
      newErrors.retypePassword = "must be different from current password.";
    }

    // check if retypePassword matches newPassword
    if (!newErrors.retypePassword && retypePassword !== newPassword) {
      newErrors.retypePassword = "Passwords do not match.";
    }

    return newErrors;
  };



  const handleGeneralSubmit = async () => {
    const generalErrors = validateGeneralForm();
    if (Object.keys(generalErrors).length === 0) {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('bio', bio);
      if (bio != user.bio && bio.length == 0)
        formData.append('bio', " ");

      // Append images only if they were changed
      if (coverImageFile) {
        formData.append('cover', coverImageFile);
      }
      if (avatarImageFile) {
        formData.append('avatar', avatarImageFile);
      }
      try {
        const access = localStorage.getItem('access');
        const response = await axios.put(`${apiUrl}/api/users/update-general-info/`, formData, {
          headers: {
            'Authorization': `Bearer ${access}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setLoading(false);
        setUser(response.data);
        setUsername(response.data.username);
        setBio(response.data.bio);
        console.log(response);
        setError("General info updated");
      } catch (error) {
        setLoading(false);
        handleFetchError(error, handleGeneralSubmit);
        if (error.response.data.error === "Username already taken.") {
          setErrors({ username: error.response.data.error });
        }
        else if (error.response.data.error === "Bio must be 150 characters or less.") {
          setErrors({ bio: error.response.data.error });
        }

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
        setError("Security info updated");
        setCurrentPassword('');
        setNewPassword('');
        setRetypePassword('');
      } catch (error) {
        setLoading(false);
        handleFetchError(error, handleSecuritySubmit);
        if (error.response.data.error === "Old password is incorrect.") {
          setErrors({ currentPassword: error.response.data.error });
        } else {
          setErrors({ currentPassword: error.response.data.error }, { newPassword: error.response.data.error }, { retypePassword: error.response.data.error });
        }
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

  const handlechangeGeneral = () => {
    // it should not change if the value is true
    setGeneral(true);
    setErrors({});
  };

  const handlechangeSecurity = () => {
    setGeneral(false);
    setErrors({});
  };

  return (
    <div className="settings-container">
      <div className="settings">
        <div className="settings-cover">
          <div
            className="user-cover"
            style={{ backgroundImage: `url(${coverImagePreview || coverUrl(user.cover)})` }}
          />
          {general && (
            <button className="cover-change_btn" onClick={handleCoverImageChange}>
              <svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" className="cover-change_icon">
                <path d="M7.96093 0.632666L7.50372 1.08989L8.91014 2.4963L9.38635 2.02009C9.60952 1.79692 9.82054 1.58969 9.99319 1.40249L8.5907 0C8.40806 0.176596 8.20547 0.387963 7.98286 0.610572L7.96093 0.632666Z" />
                <path d="M7.31706 1.27654L1.03115 7.56354C0.750732 7.84396 0.50303 8.149 0.309869 8.44927L0.0318955 9.64574L0 10L0.351593 9.97083L1.54806 9.69286C1.84833 9.4997 2.15337 9.25199 2.43379 8.97157L8.72348 2.68296L7.31706 1.27654Z" />
              </svg>
            </button>
          )}
        </div>
        <div className="settings-forms">
          <div className="settings-forms-btn-container">
            <div className="user-avatar-container">
              <img className="user-avatar" src={avatarPreview || avatarUrl(user.avatar)} alt="Avatar" />
              {general && (<button className="user-avatar-btn" onClick={handleAvatarImageChange}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  className="user-avatar-btn-icon"
                >
                  <path d="M149.1 64.8L138.7 96 64 96C28.7 96 0 124.7 0 160L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64l-74.7 0L362.9 64.8C356.4 45.2 338.1 32 317.4 32L194.6 32c-20.7 0-39 13.2-45.5 32.8zM256 192a96 96 0 1 1 0 192 96 96 0 1 1 0-192z" />
                </svg>
              </button>)
              }
            </div>
            <button
              className={general ? 'settings-forms-btn active-btn' : 'settings-forms-btn'}
              onClick={handlechangeGeneral}
            >
              General
            </button>
            {!login42 && (
              <button
                className={!general ? 'settings-forms-btn active-btn' : 'settings-forms-btn'}
                onClick={handlechangeSecurity}
              >
                Security
              </button>
            )}
          </div>
          <span className="settings-form-seperator" />
          <div className="settings-forms-container">
            {general ? (
              <form onSubmit={handleGeneralSubmit} className="form-general" key="general-form">
                <div className="form-group">
                  <label htmlFor="username">Username:</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={errors.username ? '' : username}
                    onChange={handleInputChange(setUsername, 'username')}
                    className={`form-input ${errors.username ? 'input-error shake' : ''}`}
                    placeholder={errors.username || ''}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="bio">Bio:</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={errors.bio ? '' : bio}
                    onChange={handleInputChange(setBio, 'bio')}
                    className={`form-input-bio ${errors.bio ? 'input-error shake' : ''}`}
                    placeholder={errors.bio || ''}
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
                    type="password"
                    id="current-password"
                    name="current-password"
                    value={errors.currentPassword ? '' : currentPassword}
                    onChange={handleInputChange(setCurrentPassword, 'currentPassword')}
                    className={`form-input ${errors.currentPassword ? 'input-error shake' : ''}`}
                    placeholder={errors.currentPassword || 'Current Password'}
                  />
                  <input
                    type="password"
                    id="new-password"
                    name="new-password"
                    value={errors.newPassword ? '' : newPassword}
                    onChange={handleInputChange(setNewPassword, 'newPassword')}
                    className={`form-input ${errors.newPassword ? 'input-error shake' : ''}`}
                    placeholder={errors.newPassword || 'New Password'}
                  />
                  <input
                    type="password"
                    id="retype-password"
                    name="retype-password"
                    value={errors.retypePassword ? '' : retypePassword}
                    onChange={handleInputChange(setRetypePassword, 'retypePassword')}
                    className={`form-input ${errors.newPassword ? 'input-error shake' : ''}`}
                    placeholder={errors.newPassword || 'Repeat New password'}
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
