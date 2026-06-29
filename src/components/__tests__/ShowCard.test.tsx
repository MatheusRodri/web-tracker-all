import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShowCard } from '../ShowCard';
import { TrackedShow } from '@/lib/firestore';

const mockMovie: TrackedShow = {
  id: 'show-1',
  userId: 'user-1',
  imdbID: 'tt1234567',
  title: 'Inception',
  type: 'movie',
  year: '2010',
  poster: 'https://example.com/inception.jpg',
  genre: 'Sci-Fi',
  director: 'Christopher Nolan',
  runtime: '148 min',
  production: 'Warner Bros.',
  country: 'USA',
  status: 'Watched',
  rating: 5,
  platform: 'Netflix',
  timesWatched: 2,
  watchOrder: 1,
  createdAt: { seconds: 123456789, nanoseconds: 0 }
};

const mockSeries: TrackedShow = {
  id: 'show-2',
  userId: 'user-1',
  imdbID: 'tt7654321',
  title: 'Breaking Bad',
  type: 'series',
  year: '2008',
  poster: 'https://example.com/breakingbad.jpg',
  genre: 'Drama',
  director: 'Vince Gilligan',
  runtime: '49 min',
  production: 'Sony Pictures',
  country: 'USA',
  status: 'Watching',
  rating: 4,
  platform: 'Prime Video',
  timesWatched: 1,
  watchOrder: null,
  currentSeason: 5,
  currentEpisode: 12,
  seasonsCount: 5,
  episodesCount: 62,
  createdAt: { seconds: 123456790, nanoseconds: 0 }
};

describe('ShowCard component', () => {
  test('renders movie card details correctly', () => {
    const handleClick = jest.fn();
    render(<ShowCard show={mockMovie} onClick={handleClick} />);

    // Check title and platform
    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.getByText('Netflix')).toBeInTheDocument();

    // Check status badge translation
    expect(screen.getByText('Assistido')).toBeInTheDocument();

    // Check watch order badge
    expect(screen.getByText('#1')).toBeInTheDocument();

    // Check times watched count (movie with timesWatched > 1)
    expect(screen.getByText('Visto 2x')).toBeInTheDocument();

    // Check poster image
    const image = screen.getByAltText('Inception');
    expect(image).toHaveAttribute('src', 'https://example.com/inception.jpg');

    // Click triggers onClick handler
    fireEvent.click(screen.getByTestId('show-card'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('renders series card details correctly', () => {
    const handleClick = jest.fn();
    render(<ShowCard show={mockSeries} onClick={handleClick} />);

    // Check title and platform
    expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    expect(screen.getByText('Prime Video')).toBeInTheDocument();

    // Check status badge translation
    expect(screen.getByText('Assistindo')).toBeInTheDocument();

    // Check watch order badge is NOT present since watchOrder is null
    expect(screen.queryByText('#')).not.toBeInTheDocument();

    // Check current season and episode progress string
    expect(screen.getByText('T5: Ep12')).toBeInTheDocument();

    // Check "Visto 1x" is NOT rendered for series (or only for movies)
    expect(screen.queryByText('Visto 1x')).not.toBeInTheDocument();
  });
});
