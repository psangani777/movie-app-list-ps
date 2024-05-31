import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_KEY = "2dca580c2a14b55200e784d157207b4d";

const MovieAppList = () => {
  const [moviesByYear, setMoviesByYear] = useState({});
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const bottomBoundaryRef = useRef(null);
  const [currentYear, setCurrentYear] = useState(2012);

  useEffect(() => {
    fetchGenres();
    fetchMoviesByYear(currentYear);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const bottom =
        Math.ceil(window.innerHeight + window.scrollY) >=
        document.documentElement.scrollHeight;

      if (bottom && hasMore) {
        setCurrentYear(currentYear + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasMore, currentYear]);
  useEffect(() => {
    fetchMoviesByYear(currentYear);
  }, [currentYear]);

  const fetchGenres = async () => {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`
      );
      setGenres(response.data.genres);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const fetchMoviesByYear = async (year) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&primary_release_year=${year}&vote_count.gte=100&page=${page}`
      );
      const newMovies = response.data.results.slice(0, 20);
      setMoviesByYear((prevMoviesByYear) => ({
        ...prevMoviesByYear,
        [year]: newMovies,
      }));
      setLoading(false);
      setHasMore(page < 5); // Set a limit to 5 pages for demonstration purposes
    } catch (error) {
      console.error("Error fetching movies by year:", error);
      setLoading(false);
    }
  };

  const handleGenreChange = (genreId) => {
    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(selectedGenres.filter((id) => id !== genreId));
    } else {
      setSelectedGenres([...selectedGenres, genreId]);
    }
  };

  const filterMoviesByGenre = (movies) => {
    if (selectedGenres.length === 0) return movies;
    return movies.filter((movie) =>
      movie.genre_ids.some((genreId) => selectedGenres.includes(genreId))
    );
  };

  return (
    <div className="container">
      <div className="header-wrap">
        <div className="logo-icon">MOVIEFIX</div>
        <div className="genre-filter">
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => handleGenreChange(genre.id)}
              className={selectedGenres.includes(genre.id) ? "active" : ""}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>
      <div className="movies-container">
        {loading && <p>Loading...</p>}
        {Object.entries(moviesByYear).map(([year, movies]) => (
          <div key={year} className="movies-by-year">
            <h2>{year}</h2>
            <div className="movies-grid">
              {filterMoviesByGenre(movies).map((movie, index) => (
                <div key={movie.id} className="movie">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                  />
                  <div className="movie-info">
                    <h3>{movie.title}</h3>
                    <p>Rating: {movie.vote_average}</p>
                  </div>
                  {index === movies.length - 1 && (
                    <div ref={bottomBoundaryRef} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieAppList;
