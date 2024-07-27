import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);

    const toggleForm = () => {
        setIsLogin(!isLogin);
    };

    const formik = useFormik({
        initialValues: {
            email: '',
            username: '',
            password: '',
        },
        validationSchema: Yup.object({
            email: Yup.string().email('Invalid email address').required('Required'),
            username: Yup.string()
                .min(3, 'Must be at least 3 characters')
                .max(15, 'Must be 15 characters or less')
                .required('Required'),
            password: Yup.string()
                .min(8, 'Must be at least 8 characters')
                .required('Required'),
        }),
        onSubmit: (values) => {
            // Handle form submission
            console.log(values);
        },
    });

    return (
        <>
            <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
            <form onSubmit={formik.handleSubmit}>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                />
                {formik.touched.email && formik.errors.email ? (
                    <div className="error">{formik.errors.email}</div>
                ) : null}

                {!isLogin && (
                    <>
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.username}
                        />
                        {formik.touched.username && formik.errors.username ? (
                            <div className="error">{formik.errors.username}</div>
                        ) : null}
                    </>
                )}

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                />
                {formik.touched.password && formik.errors.password ? (
                    <div className="error">{formik.errors.password}</div>
                ) : null}

                <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
            </form>
            <button className="toggle-btn" onClick={toggleForm}>
                {isLogin ? 'Switch to Sign Up' : 'Switch to Login'}
            </button>
            <div className="auth-buttons">
                <button className="google-btn">Login with Google</button>
                <button className="42-btn">Login with 42</button>
            </div>
        </>
    );
};

export default AuthForm;
