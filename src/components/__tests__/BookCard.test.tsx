import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookCard } from '../BookCard';
import { TrackedBook } from '@/lib/firestore';

const mockReadingBook: TrackedBook = {
  id: 'book-1',
  userId: 'user-1',
  title: '1984',
  author: 'George Orwell',
  genre: 'Distopia',
  totalPages: 328,
  currentPage: 164,
  format: 'Physical',
  status: 'Reading',
  rating: 4,
  timesRead: 1,
  createdAt: { seconds: 123456789, nanoseconds: 0 }
};

const mockReadBook: TrackedBook = {
  id: 'book-2',
  userId: 'user-1',
  title: 'Fahrenheit 451',
  author: 'Ray Bradbury',
  genre: 'Sci-Fi',
  totalPages: 256,
  currentPage: 256,
  format: 'Kindle',
  status: 'Read',
  rating: 5,
  timesRead: 2,
  createdAt: { seconds: 123456790, nanoseconds: 0 }
};

describe('BookCard component', () => {
  test('renders reading book details correctly', () => {
    const handleClick = jest.fn();
    render(<BookCard book={mockReadingBook} onClick={handleClick} />);

    // Title, Author and Genre
    expect(screen.getByText('1984')).toBeInTheDocument();
    expect(screen.getByText('George Orwell')).toBeInTheDocument();
    expect(screen.getByText('Distopia')).toBeInTheDocument();

    // Format and status
    expect(screen.getByText('Physical')).toBeInTheDocument();
    expect(screen.getByText('Lendo')).toBeInTheDocument();

    // Progress percentage
    expect(screen.getByText('50%')).toBeInTheDocument();

    // Current page / total page numbers
    expect(screen.getByText('Pág. 164 / 328')).toBeInTheDocument();

    // Fire click event
    fireEvent.click(screen.getByTestId('book-card'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('renders completed (read) book details correctly', () => {
    const handleClick = jest.fn();
    render(<BookCard book={mockReadBook} onClick={handleClick} />);

    // Title, Author and Genre
    expect(screen.getByText('Fahrenheit 451')).toBeInTheDocument();
    expect(screen.getByText('Ray Bradbury')).toBeInTheDocument();

    // Status
    expect(screen.getByText('Lido')).toBeInTheDocument();

    // Progress percentage
    expect(screen.getByText('100%')).toBeInTheDocument();

    // Times read badge since timesRead > 1
    expect(screen.getByText('Lido 2x')).toBeInTheDocument();
  });
});
