import { FaChevronRight } from "react-icons/fa";
import './Index.css';
import { Link } from "react-router-dom";

function Index() {
    return (
        <div className="container-fluid p-0">
            <div className="index">
                <section className="text-center content mt-5">
                    <h1>
                        Confused what to watch next?
                    </h1>
                    <h3>
                        Get best recommendataions that suits your taste.
                    </h3>

                    <div className="right content-mail">
                        <button>
                            <Link to='/signin' className="">Get started</Link>
                            <FaChevronRight />
                        </button>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default Index