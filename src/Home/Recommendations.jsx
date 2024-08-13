import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import './Recommendation.css';
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Recommendations = () => {
    const [genreMovies, setGenreMovies] = useState([]);
    const [genrePosters, setGenrePosters] = useState([]);
    const [yearMovies, setYearMovies] = useState([]);
    const [yearPosters, setYearPosters] = useState([]);
    const [choiceIdx, setChoiceIdx] = useState([]);
    const [choicePosters, setChoicePosters] = useState([]);
    const [movies, setMovies] = useState([]);
    const [result, setResult] = useState([]);
    const [Error, setError] = useState("");
    const location = useLocation();
    const navigate = useNavigate();

    const [selectedGenre, setSelectedGenre] = useState('Action');
    const [selectedYear, setSelectedYear] = useState('2016');

    const genreList = useMemo(() => location.state?.genreList, [location.state]);
    const castList = useMemo(() => location.state?.castList, [location.state]);

    useEffect(() => {
        axios.post('http://127.0.0.1:5000/recommendations', { genreList, castList }, { withCredentials: true })
            .then(response => {
                if (response.status === 200) {
                    setGenreMovies(response.data.genre_movies);
                    setGenrePosters(response.data.genre_posters);
                    setYearMovies(response.data.year_movies);
                    setYearPosters(response.data.year_posters);
                    setChoiceIdx(response.data.choice_idx);
                    setChoicePosters(response.data.choice_posters);
                    setMovies(response.data.movie_names);
                    setResult(response.data.movies_result);
                    // console.log(result[227][2]);
                } else if (response.status === 401 || response.data.message === "Session not found") {
                    setError("Session not found. Redirecting to login...");
                    setTimeout(() => {
                        navigate('/choices');  // Redirect to the signin page
                    }, 3000);
                }
            })
            .catch(error => {
                console.error('Failed to fetch recommendations', error);
            });
    }, [genreList, castList, navigate]);

    const genres = ['Action', 'Family', 'Comedy', 'Horror', 'Romance', 'Animation', 'Drama'];
    const years = ['2016', '2015', '2014', '2013', '2012'];

    const genreSelected = async (genre) => {

        setSelectedGenre(genre);
        const url = 'http://127.0.0.1:5000/getByGenre';
        try {
            const response = await axios.post(url, { genre }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

            const data = response.data;
            setGenreMovies(data[0].genre_movies || []);
            setGenrePosters(data[1].genre_posters || []);
            // console.log(genreMovies)
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const yearSelected = async (year) => {

        setSelectedYear(year);
        const url = "http://127.0.0.1:5000/getByYear";
        try {
            const response = await axios.post(url, { year }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

            const data = response.data;
            setYearMovies(data[0].year_movies || []);
            setYearPosters(data[1].year_posters || []);
            // console.log('Year Movies:', yearMovies);
            // console.log('Year Posters:', yearPosters);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <>
            {Error && <p>{Error}</p>}
            {!Error && (
                <>

                    <div className="carousel-container">
                        <div id="carouselExampleIndicators" className="carousel slide" data-bs-ride="carousel">
                            <div className="carousel-indicators">
                                {choiceIdx.map((_, index) => (
                                    <button key={index}
                                        data-bs-target="#carouselExampleIndicators"
                                        data-bs-slide-to={index}
                                        className={index === 0 ? "active" : ""}
                                        type="button"
                                    >
                                    </button>
                                ))}
                            </div>

                            <div className="carousel-inner">
                                {choiceIdx.map((idx, index) => (
                                    <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                                        <Link to={`/movie/${result[idx][2]}`}>
                                            <div className="slider">
                                                <div className="slider-content">
                                                    <div>
                                                        <h1 className="movie-title">{result[idx][2]}</h1>
                                                        {result[idx][4] && <p className="movie-des">{result[idx][4]}</p>}
                                                    </div>
                                                <button className="slider-btn btn" >Watch Now</button>
                                                </div>
                                                <img src={choicePosters[index]} alt={movies[idx]} />
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>

                            <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
                                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span className="visually-hidden">Previous</span>
                            </button>
                            <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
                                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                <span className="visually-hidden">Next</span>
                            </button>
                        </div>
                    </div>

                    <div className="container-fluid mb-2">
                        <div className=" d-flex align-items-center">
                            <h4 className="title">Genre&apos;s</h4>
                            <div className="dropdown mx-3">
                                <button
                                    className="btn btn-secondary dropdown-toggle"
                                    type="button"
                                    id="genreDropdown"
                                    data-bs-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                >
                                    {selectedGenre}
                                </button>
                                <div className="dropdown-menu" aria-labelledby="genreDropdown">
                                    {genres.map((genre) => (
                                        <a
                                            className="dropdown-item"
                                            href="#"
                                            key={genre}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                genreSelected(genre)
                                            }}
                                        >
                                            {genre}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="row movie-list" id="genre-row">
                            {genreMovies && genreMovies.slice(0, 6).map((movie, index) => (
                                <div className="col-6 col-sm-4 col-md-2 movie-card" key={index}>
                                    <Link to={`/movie/${movie}`}>
                                        <img src={genrePosters[index]} className="card-img" alt={movie} />
                                        <p className="text-link">{movie}</p>
                                    </Link>
                                </div>
                            ))}
                        </div>

                        <div className="row mb-2 mt-3">
                            <div className=" d-flex align-items-center">
                                <h4 className="title">Best of year</h4>
                                <div className="dropdown mx-3">
                                    <button
                                        className="btn btn-secondary dropdown-toggle"
                                        type="button"
                                        id="yearDropdown"
                                        data-bs-toggle="dropdown"
                                        aria-haspopup="true"
                                        aria-expanded="false"
                                    >
                                        {selectedYear}
                                    </button>
                                    <div className="dropdown-menu" aria-labelledby="yearDropdown">
                                        {years.map((year) => (
                                            <a
                                                className="dropdown-item"
                                                href="#"
                                                key={year}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    yearSelected(year)
                                                }}
                                            >
                                                {year}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="row movie-list" >
                                {yearMovies.length > 0 && yearMovies.slice(0, 6).map((movie, index) => (
                                    <div className="col-6 col-sm-4 col-md-2 movie-card" key={index}>
                                        <Link to={`/movie/${movie}`}>
                                            <img src={yearPosters[index]} className="card-img" alt={movie} />
                                            <p className="text-link">{movie}</p>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </>
            )}
        </>
    );
};

export default Recommendations;
