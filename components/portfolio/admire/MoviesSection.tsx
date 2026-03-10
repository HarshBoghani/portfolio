'use client';

import MovieCard from './MovieCard';
import { MOVIES_PLACEHOLDER } from './movies-data';

export default function MoviesSection() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {MOVIES_PLACEHOLDER.map((movie) => (
        <MovieCard key={movie.id} {...movie} />
      ))}
    </section>
  );
}
