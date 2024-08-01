import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import 'select2/dist/css/select2.min.css';
import $ from 'jquery';
import 'select2';

const MovieComponent = ({ movieNames, movies, trailerKey, recommendations, posters }) => {
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    // Initialize Select2
    $('#movieSelect').select2().on('change', function (e) {
      setSelectedMovie(e.target.value);
    });

    // Enable tooltips
    $('[data-toggle="tooltip"]').tooltip();

    // Initialize carousel
    $('.carousel').carousel({
      interval: 500000,
      keyboard: true
    });

    // Limit genre and cast selection
    const genreLimit = 3;
    $('input.genre-checkbox').on('change', function (evt) {
      if ($('input[name="genre-checkbox"]:checked').length > genreLimit) {
        this.checked = false;
      }
    });

    const castLimit = 5;
    $('input.cast-checkbox').on('change', function (evt) {
      if ($('input[name="cast-checkbox"]:checked').length > castLimit) {
        this.checked = false;
      }
    });
  }, []);

  useEffect(() => {
    if (selectedMovie) {
      const url = `http://127.0.0.1:5000/movie/${selectedMovie}`;
      window.location = url;
    }
  }, [selectedMovie]);

  const genreSelected = () => {
    const selectedGenre = $('#genres').val();
    const url = "http://127.0.0.1:5000/getByGenre";
    $.post(url, { genre: selectedGenre }, (data, status) => {
      let htmlContent = '';
      for (let i = 0; i < data[0].genre_movies.length; i++) {
        htmlContent += `<div class='col-6 col-sm-4 col-md-2 movie-card'>
                          <a href='/movie/${data[0].genre_movies[i]}'>
                            <img src='${data[1].genre_posters[i]}' alt='' style='width: 100%;height: auto;'>
                            <p>${data[0].genre_movies[i]}</p>
                          </a>
                        </div>`;
      }
      $('#genre-row').html(htmlContent);
    });
  };

  const yearSelected = () => {
    const selectedYear = $('#years').val();
    const url = "http://127.0.0.1:5000/getByYear";
    $.post(url, { year: selectedYear }, (data, status) => {
      let htmlContent = '';
      for (let i = 0; i < data[0].year_movies.length; i++) {
        htmlContent += `<div class='col-6 col-sm-4 col-md-2 movie-card'>
                          <a href='/movie/${data[0].year_movies[i]}'>
                            <img src='${data[1].year_posters[i]}' alt='' style='width: 100%;height: auto;'>
                            <p>${data[0].year_movies[i]}</p>
                          </a>
                        </div>`;
      }
      $('#year-row').html(htmlContent);
    });
  };

  return (
    <div>
      {/* Header */}
      <nav className="navbar">
        <img src="../static/images/logo.png" className="brand-logo" alt="" />
        <div className="right-container">
          <select id="movieSelect" className="select2 form-control" style={{ width: '220px' }}>
            <option disabled hidden selected value="sm" id="search-movie">Search Movie</option>
            {movieNames.map((item, index) => (
              <option key={index} value={item}>{item}</option>
            ))}
          </select>
          <i className="fa fa-search"></i>
          <a data-toggle="tooltip" title="Logout">
            <img src="https://www.hotstar.com/assets/c724e71754181298e3f835e46ade0517.svg" alt="User logout" width="30px" />
          </a>
        </div>
      </nav>

      {/* Movie Section */}
      <div className="container-fluid">
        <div className="row movie-box">
          <div className="movie-vid col-md-8 d-md-none">
            <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&showinfo=0&controls=0&mute=1&playlist=${trailerKey}&loop=1`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
          </div>
          <div className="movie-text col-md-4">
            <div className="d-flex mx-auto">
              <div className="text-wrapper">
                <h2>{movies[movieIdx].title}</h2>
                {movies[movieIdx].tagline && <h4>{movies[movieIdx].tagline}</h4>}
                <small>
                  {movies[movieIdx].genres.map((item, index) => (
                    <span key={index}>{item} .</span>
                  ))}
                </small> <br />
                <small>
                  {movies[movieIdx].cast.map((item, index) => (
                    <span key={index}>{item} .</span>
                  ))}
                </small> <br />
                {movies[movieIdx].release_date && <small>{movies[movieIdx].release_date}</small>} <br /><br />
                {movies[movieIdx].overview && <p className="text-contain">{movies[movieIdx].overview}</p>}
              </div>
            </div>
          </div>
          <div className="movie-vid col-md-8 d-none d-md-block">
            <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&showinfo=0&controls=0&mute=1&playlist=${trailerKey}&loop=1`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="container-fluid mb-3">
        <div className="row">
          <h4 className="title">More Like This</h4>
        </div>
        <div className="row movie-list">
          {recommendations.slice(0, 6).map((rec, i) => (
            <div className="col-6 col-sm-4 col-md-2 movie-card" key={i}>
              <a href={rec}>
                <img src={posters[i]} className="card-img" alt="" />
                <p className="text-contain">{rec}</p>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieComponent;
