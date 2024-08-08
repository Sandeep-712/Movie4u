import { Link } from 'react-router-dom';
import './ForgetPass.css';
import { useState } from 'react';

function ForgetPass() {
    const [Email,setEmail]=useState("");

    const handleSubmit=(e)=>{
        e.preventDefault();

        try{
            if(Email!==""){
                alert("Password reset link has been sent to your email. Please check your email and verify.");
            }else{
                alert("Please enter your email");
            }
        }catch(err){
            console.log(err);
        }
    }

    return (
        <div className="container-fluid p-0">
            <div className="index">
                <section className="forget-form">
                    <div className="login-div" style={{ padding: "25px" }}>
                        {/* <h2 className='text-center' style={{ color: "aliceblue" }}>Validate OTP</h2> */}
                        {/* <p>We have sent an OTP to your email. <br /> Verify the OTP to reset your password. </p> */}
                        <form id="forgot-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <input placeholder="Email" type="email" name="user_email" required className='form-control' value={Email} onChange={(e)=>setEmail(e.target.value)} />
                            </div>
                            <div className="d-flex justify-content-center">
                                <Link to='/reset'>
                                    <button id="forgot-btn" type="submit" className="btn forgetbtn btn-primary mt-4">Reset Password</button>
                                </Link>
                            </div>
                        </form>
                        <p className="text-center" id="err"></p>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default ForgetPass;