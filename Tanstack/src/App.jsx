import { useMutation, useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { memo } from 'react';
import './App.css';

const App = () => {

  const queryClient = useQueryClient();

  const getMovies = async () => {
    const res = await fetch('http://localhost:3000/movies');
    return res.json();
  };

  const addPost = async (newMovie) => {
    const res = await fetch('http://localhost:3000/movies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMovie),
    });
    return res.json();
  };

  const deleteMovie = async (movieId) => {
    await fetch(`http://localhost:3000/movies/${movieId}`, {
      method: 'DELETE',
    });
    return movieId;
  };

  const { mutate: addMovieMutate, isError: isAddError, error: addError } = useMutation({
    mutationKey: ['add-movie'],
    mutationFn: addPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    }
  });

  const { mutate: deleteMovieMutate } = useMutation({
    mutationKey: ['delete-movie'],
    mutationFn: deleteMovie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    }
  });

  const { data, isError, isLoading, isPending, error } = useQuery({
    queryKey: ['movies'],
    queryFn: getMovies,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const name = formData.get('title');
    const genres = Array.from(formData.keys())
      .filter((key) => key !== 'title' && formData.get(key) === 'on');

    addMovieMutate({ name, genres });
    e.target.reset();
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="enter movie name" name="title" />
        <label>Action</label>
        <input type="checkbox" name="action" />
        <label>Sci-Fi</label>
        <input type="checkbox" name="sci-fi" />
        <label>Drama</label>
        <input type="checkbox" name="drama" />
        <button type="submit">Add Movie</button>
      </form>

      {isLoading && <h1>Loading...</h1>}
      {isError && <h1>Error: {error.message}</h1>}
      {isPending && <h1>Pending...</h1>}
      {isAddError && <p>Failed to add movie: {addError.message}</p>}

      {data?.map((movie) => (
        <div key={movie.id} className="post">
          <h2>{movie.name} {movie.id}</h2>
          <p>
            {movie.genres.map((gen, i) => (
              <span key={i} className="genre">{gen} </span>
            ))}
          </p>

          {/* DELETE BUTTON FIXED */}
          <button
            type="button"
            onClick={() => deleteMovieMutate(movie.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default memo(App);
