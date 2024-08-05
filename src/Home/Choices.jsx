import { useState, useEffect } from "react";
import './Choices.css';
import { useNavigate } from 'react-router-dom';

const Choices = () => {
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedCasts, setSelectedCasts] = useState([]);
    const [genreName, setgenreName] = useState([]);
    const [castName, setcastName] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch data from Flask backend
        const fetchData = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/choices');
                const data = await response.json();
                setgenreName(data.genre_names);
                setcastName(data.cast_names);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleGenreChange = (e) => {
        const { value, checked } = e.target;

        if (checked) {
            if (selectedGenres.length < 3) {
                setSelectedGenres([...selectedGenres, value]);
            }
            else {
                e.target.checked = false;
            }
        }
        else {
            setSelectedGenres(selectedGenres.filter((genre) => genre !== value));
        }
    };

    const handleCastChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            if (selectedCasts.length < 5) {
                setSelectedCasts([...selectedCasts, value]);
            }
            else {
                e.target.checked = false;
            }
        } else {
            setSelectedCasts(selectedCasts.filter((cast) => cast !== value));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedGenres.length !== 3 && selectedCasts.length !== 5) {
            alert('Please select 3 genres and 5 casts.');
            return;
        }
        navigate('/recommendations', { state: { genreList: selectedGenres, castList: selectedCasts } });
    }



    return (
        <div className="container">
            <form  id="choice-form" onSubmit={handleSubmit}>
                <div className="select-heading">
                    <h2>Select your top 3 Genres</h2>
                </div>
                <div className="row">
                    <ul className="select-list">
                        {genreName.map((genre, index) => (
                            <div className="col" key={`genre-${index}`}>
                                <li>
                                    <label>
                                        <input
                                            type="checkbox"
                                            className="genre-checkbox"
                                            name="genre-checkbox"
                                            value={genre.split(' ').join('-')}
                                            onChange={handleGenreChange}
                                        />
                                        <div className="select-box">
                                            <p className="select-name" style={{ WebkitLineClamp: 1 }}>
                                                {genre}
                                            </p>
                                        </div>
                                    </label>
                                </li>
                            </div>
                        ))}
                    </ul>
                </div>


                <div className="select-heading">
                    <h2>Select your top 5 Cast</h2>
                </div>
                <div className="row">
                    <ul className="select-list">
                        {castName.map((cast, index) => (
                            <div className="col" key={`cast-${index}`}>
                                <li>
                                    <label>
                                        <input
                                            type="checkbox"
                                            className="cast-checkbox"
                                            name="cast-checkbox"
                                            value={cast.split(' ').join('-')}
                                            onChange={handleCastChange}
                                        />
                                        <div className="select-box">
                                            <p className="select-name" style={{ WebkitLineClamp: 2 }}>
                                                {cast}
                                            </p>
                                        </div>
                                    </label>
                                </li>
                            </div>
                        ))}
                    </ul>
                </div>
                <button id="choice-btn" className="select-submit" type="submit">Done</button>
            </form>
        </div>
    )
}

export default Choices;