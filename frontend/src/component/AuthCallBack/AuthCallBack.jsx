import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import da2ira from '../loadingPage/da2ira.svg'
import moraba3 from '../loadingPage/moraba3.svg'
import x from '../loadingPage/x.svg'
import motalat from '../loadingPage/motalat.svg'
import '../loadingPage/loadingPage.css'


const apiUrl = process.env.REACT_APP_API_URL;

const AuthCallBack = ({ setAuth }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (code) {
            // Call the backend to exchange the code for tokens
            const fetchTokens = async () => {
                try {
                    const response = await axios.get(
                        `${apiUrl}/api/users/auth/callback/?code=${code}`
                    );
                    const { access, refresh } = response.data;

                    setAuth(access, refresh); // Call handleLogin with the access token
                    navigate("/"); // Navigate to the home page or desired page
                } catch (error) {
                    console.error("Error fetching tokens: ", error);
                    navigate("/");
                }
            };
            fetchTokens();
        }
    }, []);

    return (
        <>
            <div className="LoadingPagecontent">
                <div className='ashkal'>
                    <div className="first">
                        <img src={moraba3} alt="" className='moraba3' />
                    </div>
                    <div className="second">
                        <img src={x} alt="" className='x' />
                    </div>
                    <div className="third">
                        <img src={motalat} alt="" className='motalat' />
                    </div>
                    <div className="fourth">
                        <img src={da2ira} alt="" className='da2ira' />
                    </div>
                </div>
                <span>Loading...</span>
            </div>
        </>
    );
}


export default AuthCallBack;