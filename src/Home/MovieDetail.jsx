import { useState, useEffect } from "react";
import { useParams, Link } from 'react-router-dom';
import "./MovieDetail.css";
import axios from 'axios';

function MovieDetail() {
    const { movie_name } = useParams();  // Extract movie_name from URL
    const [movieDetails, setMovieDetails] = useState(null);
    const [trailerKey, setTrailerKey] = useState('');
    const [movie_genre, setMovieGenre] = useState([]);
    const [movie_cast, setMovieCast] = useState([]);
    const [recommendations, setrecommendations] = useState([]);
    const [posters, setposter] = useState([]);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:5000/movie/${movie_name}`, { withCredentials: true });
                const data = response.data;
                // console.log("Movie trailer", data.trailer_key);
                // console.log("Movie Details", data.movies[data.movie_idx][5]);
                // console.log("Movie Details", data.movies[data.movie_idx][7]);

                setMovieDetails(data.movies[data.movie_idx]);
                setTrailerKey(data.trailer_key);
                setrecommendations(data.recommendations);
                setposter(data.posters);
                console.log("reco", recommendations);
                console.log("psmf", posters);

                // Split genres and cast into arrays
                const genresString = data.movies[data.movie_idx][5] || '';
                const castString = data.movies[data.movie_idx][7] || '';
                setMovieGenre(genresString.split('$'));
                setMovieCast(castString.split('$'));

            } catch (error) {
                console.error("Error fetching movie details:", error);
            }
        };

        fetchMovieDetails();
    }, [movie_name]);

    if (!movieDetails) {
        return <div className="container" style={{ color: "aliceblue", fontSize: '40px', textAlign: "center", height: "45px" }}>Loading...</div>;
    }

    return (
        <div className="container-fluid">
            <div className="row movie-box mt-3">
                <div className="movie-text col-md-4">
                    <div className="d-flex mx-auto">
                        <div className="text-wrapper">
                            <h2>{movieDetails[2]}</h2>
                            {movieDetails[3] && <h4>{movieDetails[3]}</h4>}
                            <small>
                                {movie_genre.map((genre, index) => (
                                    <span key={index}>{genre} . </span>
                                ))}
                            </small>
                            <br />
                            <small>
                                {movie_cast.map((cast, index) => (
                                    <span key={index}>{cast} . </span>
                                ))}
                            </small>
                            <br />
                            {movieDetails[10] && (
                                <>
                                    <small>{movieDetails[10]}</small>
                                    <br />
                                    <br />
                                </>
                            )}
                            {movieDetails[4] && <p className="text-contain" style={{ color: "whitesmoke" }}>{movieDetails[4]}</p>}
                        </div>
                    </div>
                </div>
                <div className="movie-vid col-md-6 d-none d-md-block">
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&showinfo=0&controls=0&mute=1&playlist=${trailerKey}&loop=1`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
            {/* <div className="movie-vid col-md-8 d-none d-md-block">
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&showinfo=0&controls=0&mute=1&playlist=${trailerKey}&loop=1`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div> */}

            {/* Recommendations Section */}
            <div className="container-fluid mb-3">
                <div className="row">
                    <h3 className="title">More Like This</h3>
                </div>

                <div className="row movie-list">
                    {recommendations.map((rec, index) => (
                        <div className="col-6 col-sm-4 col-md-2 movie-card" key={index}>
                            <Link to={`/movie/${rec}`}>
                                {posters[index] && <img src={posters[index]} className="card-img" alt={rec} />}
                                <p className="text-contain" style={{ color: "wheat" }}>
                                    {rec}
                                </p>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MovieDetail;
