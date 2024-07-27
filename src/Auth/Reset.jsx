import './Reset.css';

function Reset() {
    return (
        <div className="container-fluid p-0">
            <div className="index">
                <section className="reset-form">
                    <div className="reset-div" style={{ padding: "25px" }}>
                        <h2 className='text-center' style={{ color: "aliceblue" }}>Reset Password</h2>
                        <form id="reset-form">
                            <div className="form-group">
                                <input placeholder="New Password" type="password" name="new_password" required className='form-control' />
                            </div>
                            <div className="d-flex justify-content-center">
                                <button id="reset-btn" type="submit" className="btn resetbtn btn-primary mt-3">Reset</button>
                            </div>
                        </form>
                        <p className="text-center" id="reset-err"></p>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default Reset