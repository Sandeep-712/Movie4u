import { useState, useEffect, useMemo } from "react"
import { useLocation } from "react-router-dom";
import './Recommendation.css'

const Recommendations = () => {

    const [genreMovies, setGenreMovies] = useState([]);
    const [genrePosters, setGenrePosters] = useState([]);
    const [yearMovies, setYearMovies] = useState([]);
    const [yearPosters, setYearPosters] = useState([]);
    const [choiceIdx, setChoiceIdx] = useState([]);
    const [choicePosters, setChoicePosters] = useState([]);
    const [movies, setMovies] = useState([]);
    const location = useLocation();

    const [selectedGenre, setSelectedGenre] = useState('Action');
    const [selectedYear, setSelectedYear] = useState('2016');



    const genreList = useMemo(() => location.state?.genreList, [location.state]);
    const castList = useMemo(() => location.state?.castList, [location.state]);


    useEffect(() => {
        const fetchRecommendations = async () => {
            const url = 'http://127.0.0.1:5000/recommendations';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ genreList, castList }),
            });

            if (response.ok) {
                const data = await response.json();
                setGenreMovies(data.genre_movies);
                setGenrePosters(data.genre_posters);
                setYearMovies(data.year_movies);
                setYearPosters(data.year_posters);
                setChoiceIdx(data.choice_idx);
                setChoicePosters(data.choice_posters);
                setMovies(data.movie_names);
                console.log(data);
            } else {
                console.error('Failed to fetch recommendations');
            }
        };

        fetchRecommendations();
    }, [genreList, castList]);

    const genres = ['Action', 'Family', 'Comedy', 'Horror', 'Romance', 'Animation', 'Drama'];
    const years = ['2016', '2015', '2014', '2013', '2012'];

    const genreSelected = async (genre) => {
        setSelectedGenre(genre);
        const url = 'http://127.0.0.1:5000/getByGenre';
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ genre }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }

            const data = await response.json();
            console.log(data);
            setGenreMovies(data.genre_movies);
            setGenrePosters(data.genre_posters);
        }
        catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const yearSelected = async (year) => {
        setSelectedYear(year);
        const url = "http://127.0.0.1:5000/getByYear";
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ year }),
        });
        const data = await response.json();
        setYearMovies(data.year_movies);
        setYearPosters(data.year_posters);
    };



    return (
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
                                <a href={`/movie/${movies[idx].title}`}>
                                    <div className="slider">
                                        <div className="slider-content">
                                            <div>
                                                <h1 className="movie-title">{movies[idx].title}</h1>
                                                {movies[idx].overview && <p className="movie-des">{movies[idx].overview}</p>}
                                            </div>
                                        </div>
                                        <img src={choicePosters[index]} alt={movies[idx].title} />
                                    </div>
                                </a>
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




            <div className="container-fluid mb-3">
                <div className="row mb-2">
                    <h4 className="title">Genre</h4>
                    <div className="dropdown ml-3">
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
                                    onClick={() => genreSelected(genre)}
                                >
                                    {genre}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>


                <div className="row movie-list" id="genre-row">
                    {genreMovies.slice(0, 6).map((movie, index) => (
                        <div className="col-6 col-sm-4 col-md-2 movie-card" key={index}>
                            <a href={`/movie/${movie}`}>
                                <img src={genrePosters[index]} className="card-img" alt={movie} />
                                <p className="text-contain">{movie}</p>
                            </a>
                        </div>
                    ))}
                </div>

                <div className="row mb-2 mt-3">
                    <h4 className="title">Best of year</h4>
                    <div className="dropdown ml-3">
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
                                    onClick={() => yearSelected(year)}
                                >
                                    {year}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="row movie-list" id="year-row">
                    {yearMovies.slice(0, 6).map((movie, index) => (
                        <div className="col-6 col-sm-4 col-md-2 movie-card" key={index}>
                            <a href={`/movie/${movie}`}>
                                <img src={yearPosters[index]} className="card-img" alt={movie} />
                                <p className="text-contain">{movie}</p>
                            </a>
                        </div>
                    ))}
                </div>
            </div >
        </>
    )
}

export default Recommendations;