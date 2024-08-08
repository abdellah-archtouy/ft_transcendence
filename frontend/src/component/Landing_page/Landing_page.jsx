import React from 'react'
import { useState } from 'react'
import "./styles/section_1.css"
import "./styles/root.css"
import axios from 'axios'
// import center_1 from "./images/center_1.svg"


const LandingPage = ({setAuth , auth}) => {
    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = { email, password };
    
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/login/', data, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
            });
    
            if (response.status === 200) {
                const token = response.data.token;
                localStorage.setItem('token', token);
                console.log('token:',  token);
                setAuth(true);
            }
        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    };
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    return (
        <div className='landig'>
            <form onSubmit={handleSubmit} className='landing-form'>
                <textarea value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    placeholder='enter your email' id=""/>
                <textarea value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    placeholder='enter you password' id=""/>
                <button type='submit'>login</button>
            </form>
        </div>
    )
}

export default LandingPage