
function MovieDetail() {


    return (
        <div className="container-fluid">
            <div className="row movie-box">
                <div className="movie-vid col-md-8 d-md-none">
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&showinfo=0&controls=0&mute=1&playlist=${trailerKey}&loop=1`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
                <div className="movie-text col-md-4">
                    <div className="d-flex mx-auto">
                        <div className="text-wrapper">
                            <h2>{movieDetails.title}</h2>
                            {movieDetails.tagline && <h4>{movieDetails.tagline}</h4>}
                            <small>
                                {movieDetails.genres.map((genre, index) => (
                                    <span key={index}>{genre} . </span>
                                ))}
                            </small>
                            <br />
                            <small>
                                {movieDetails.cast.map((cast, index) => (
                                    <span key={index}>{cast} . </span>
                                ))}
                            </small>
                            <br />
                            {movieDetails.release_date && (
                                <>
                                    <small>{movieDetails.release_date}</small>
                                    <br />
                                    <br />
                                </>
                            )}
                            {movieDetails.overview && <p className="text-contain">{movieDetails.overview}</p>}
                        </div>
                    </div>
                </div>
                <div className="movie-vid col-md-8 d-none d-md-block">
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&showinfo=0&controls=0&mute=1&playlist=${trailerKey}&loop=1`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>

            {/* Recommendations Section */}
            <div className="container-fluid mb-3">
                <div className="row">
                    <h4 className="title">More Like This</h4>
                </div>

                <div className="row movie-list">
                    {recommendations.map((rec, index) => (
                        <div className="col-6 col-sm-4 col-md-2 movie-card" key={index}>
                            <a href={`/${rec.title}`}>
                                <img src={rec.poster} className="card-img" alt={rec.title} />
                                <p className="text-contain">{rec.title}</p>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default MovieDetail