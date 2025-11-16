import { useMutation, useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { memo } from 'react';
import './App.css';

const App = () => {
  const getMovies = async () => {
    const res = await fetch('http://localhost:3000/movies');
    return res.json();
  };

  const queryClient = useQueryClient();

  const addPost = async (newMovie) => {
    console.log("request incoming", newMovie);

    const res = await fetch('http://localhost:3000/movies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newMovie)
    });

    return res.json();
  };

  const { mutate, isError: isMutationError, error: mutaterror} = useMutation({
    mutationKey: ['add-movie'],
    mutationFn: addPost,
    onSuccess: () =>{
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
    const genres = Array.from(formData.keys()).filter((key) => key !== 'title' && formData.get(key) === 'on');
    console.log(name, genres);
    mutate({ name, genres });
    e.target.reset();
  }


  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder='enter name of movie' name='title' />
        <label htmlFor="action">Action</label>
        <input type="checkbox" name="action" id="action" />
        <label htmlFor="sci-fi">Sci-Fi</label>
        <input type="checkbox" name="sci-fi" id="sci-fi" />
        <label htmlFor="drama">Drama</label>
        <input type="checkbox" name="drama" id="drama" />
        <button type='submit'>Add Movie</button>
      </form>
      {isLoading && <h1>Loading...</h1>}
      {isError && <h1>Something went wrong! {error.message}</h1>}
      {isPending && <h1>Pending...</h1>}
      {isMutationError && <div><p>Failed to add movie. {mutaterror.message}</p></div>}

      {data?.map((movie) => (
        <div key={movie.name} className='post'>
          <h2>{movie.name}</h2>

          <p>
            {movie.genres.map((gen, i) => (
              <span key={`${movie.name}-${i}`} className='genre'>{gen} </span>
            ))}
          </p>
          <button type="button">Delete</button>
        </div>
      ))}
    </div>
  );
};

export default memo(App);
