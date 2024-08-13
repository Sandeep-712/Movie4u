import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import logo from '../assets/logo2.jpg';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://127.0.0.1:5000/check_signin')
            .then(response => {
                // setIsSignedIn(response.data.isSignedIn);
                const det = response.data.isSignedIn
                if (det !== null) {
                    setIsSignedIn(true);
                }
            })
            .catch(error => {
                console.error(error);
            });
    }, []);

    const handleSignIn = () => {
        navigate('/signin');
    };

    const handleSignOut = () => {
        axios.get('http://127.0.0.1:5000/logout')
            .then(response => {
                if (response.status === 200) {
                    navigate('/signin');
                    setIsSignedIn(false);
                }
            })
            .catch(error => {
                console.error(error);
            });
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className='container-fluid'>
                <a className="navbar-brand" href="/">
                    <img
                        src={logo}
                        width="70"
                        height="50"
                        className="d-inline-block align-top"
                        alt="Logo"
                    />
                </a>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-toggle="collapse"
                    data-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <form className="d-flex ms-auto me-3">
                        <input
                            className="form-control me-sm-2"
                            type="search"
                            placeholder="Search"
                            aria-label="Search"
                            style={{ backgroundColor: 'black', color: 'white' }}
                        />
                        <button className="btn btn-outline-success my-1 my-sm-0" type="submit">
                            <FontAwesomeIcon icon={faSearch} />
                        </button>
                    </form>
                    <ul className="navbar-nav ml-auto">
                        <li className="nav-item">
                            {isSignedIn ? (
                                <button className="btn btn-outline-primary" onClick={handleSignOut}>
                                    Log out
                                </button>
                            ) : (
                                <button className="btn btn-outline-primary" onClick={handleSignIn}>
                                    Sign In
                                </button>
                            )}
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
