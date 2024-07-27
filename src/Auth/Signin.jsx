import { useState } from "react";
import "./Signin.css"

function Signin() {
    const [isSignIn, setIsSignIn] = useState(true);

    const toggleForm = () => {                             //check user want to sign or signup
        setIsSignIn(!isSignIn);
    }

    return (

        <div className="container-fluid p-0">
            <div className="index">
                <section className="login-form ">
                    <form id="info-form">
                        <div className="login-title">
                            {isSignIn ? 'Sign In' : 'Sign Up'}
                        </div>
                        <div className="container">

                            <div className="form-group">
                                <input placeholder="Email" className="form-control mb-2" type="email" name="user_email" required />
                            </div>
                            <div className="form-group">
                                <input placeholder="Password" className="form-control mb-2" type="password" name="user_password" required />
                            </div>

                            <a className="forget d-block mt-3 text-center">{isSignIn ? 'Forgot Password' : ''}</a>
                        </div>
                        <div className="d-flex justify-content-center">
                            <button className="btn login-btn btn-primary mt-4" type="submit">{isSignIn ? 'Sign In' : 'Create Account'}</button>
                        </div>
                    </form>
                    <p className="text-center mt-3">
                        {isSignIn ?
                            (
                                <>
                                    <a className="login-check">Don&apost have account?{' '}</a>
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
                    <p className="text-center"></p>
                </section>
            </div>
        </div>
    )
}

export default Signin;