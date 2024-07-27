import './ForgetPass.css';

function ForgetPass() {
    return (
        <div className="container-fluid p-0">
            <div className="index">
                <section className="forget-form">
                    <div className="login-div" style={{ padding: "25px" }}>
                        <h2 className='text-center' style={{ color: "aliceblue" }}>Validate OTP</h2>
                        <p>We have sent an OTP to your email. <br /> Verify the OTP to reset your password. </p>
                        <form id="forgot-form">
                            <div className="form-group">
                                <input placeholder="OTP" type="text" name="user_otp" required className='form-control' />
                            </div>
                            <div className="d-flex justify-content-center">
                            <button id="forgot-btn" type="submit" className="btn forgetbtn btn-primary mt-4">Validate</button>
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