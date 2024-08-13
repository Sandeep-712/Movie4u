import { useState } from "react";
import "./Signin.css"
import axios from 'axios';
import { useNavigate } from "react-router-dom";

function Signin() {
    const [isSignIn, setIsSignIn] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();


    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const url = isSignIn ? 'http://127.0.0.1:5000/signin' : 'http://127.0.0.1:5000/signup';

            const response = await axios.post(url, {
                email,
                password
            }, { withCredentials: true });
            
            console.log()
            console.log("Response from backend", response.data)

            if (isSignIn) {
                if (response.data.message === 'recommendations') {
                    navigate('/recommendations');
                }
                else {
                    setError(response.data.message || 'An unexpected error occurred.');
                }
            }
            else if (!isSignIn) {
                if (response.data.message === 'choices') {
                    navigate('/choices');
                }
                else {
                    setError(response.data.message || 'An unexpected error occurred.');
                }
            }
        }
        catch (error) {
            console.error('Error:', error);
            setError('An error occurred while sign.');
        }
    }

    const toggleForm = () => {                             //check user want to sign or signup
        setIsSignIn(!isSignIn);
        setError(""); // Clear error message when toggling the form
    }

    return (

        <div className="container-fluid p-0">
            <div className="index">
                <section className="login-form ">
                    <form id="info-form" onSubmit={handleSubmit}>
                        <div className="login-title">
                            {isSignIn ? 'Sign In' : 'Sign Up'}
                        </div>
                        <div className="container">

                            <div className="form-group">
                                <input placeholder="Email" className="form-control mb-2" type="email" name="user_email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <input placeholder="Password" className="form-control mb-2" type="password" name="user_password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>

                            {/* {
                                isSignIn && (
                                    <Link to='/forget'>
                                        <button className="forget d-block mt-3 text-center">{isSignIn ? 'Forgot Password' : ''}</button>
                                    </Link>
                                )
                            } */}

                        </div>
                        <div className="d-flex justify-content-center">
                            <button className="btn login-btn btn-primary mt-4" type="submit">{isSignIn ? 'Sign In' : 'Create Account'}</button>
                        </div>
                    </form>
                    <p className="text-center mt-3">
                        {isSignIn ?
                            (
                                <>
                                    <a className="login-check">Don&apos;t have account?{' '}</a>
                                    <button className="btn btn-link p-0" onClick={toggleForm}>
                                        Sign Up
                                    </button>
                                </>
                            ) :
                            (
                                <>
                                    <a className="login-check">Already have an account?{' '}</a>
                                    <button className="btn btn-link p-0" onClick={toggleForm}>
                                        Sign In
                                    </button>
                                </>
                            )
                        }
                    </p>
                    {error && <div id="error" style={{ color: 'red' }}>{error}</div>}
                </section>
            </div>
        </div>
    )
}

export default Signin;