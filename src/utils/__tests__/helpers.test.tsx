import React from 'react';
import { render, screen } from '@testing-library/react';
import { renderStars, STREAMING_PLATFORMS, BOOK_FORMATS, COURSE_PLATFORMS } from '../helpers';

describe('Helper Constants', () => {
  test('STREAMING_PLATFORMS is an array of strings containing standard platforms', () => {
    expect(Array.isArray(STREAMING_PLATFORMS)).toBe(true);
    expect(STREAMING_PLATFORMS).toContain('Netflix');
    expect(STREAMING_PLATFORMS).toContain('Prime Video');
  });

  test('BOOK_FORMATS is an array of strings containing standard formats', () => {
    expect(Array.isArray(BOOK_FORMATS)).toBe(true);
    expect(BOOK_FORMATS).toContain('Physical');
    expect(BOOK_FORMATS).toContain('Kindle');
  });

  test('COURSE_PLATFORMS is an array of strings containing standard platforms', () => {
    expect(Array.isArray(COURSE_PLATFORMS)).toBe(true);
    expect(COURSE_PLATFORMS).toContain('Udemy');
    expect(COURSE_PLATFORMS).toContain('Coursera');
  });
});

describe('renderStars utility function', () => {
  test('renders exactly 5 star elements', () => {
    render(<>{renderStars(3)}</>);
    const stars = screen.getAllByText('★');
    expect(stars).toHaveLength(5);
  });

  test('applies golden color to active stars and muted color to inactive stars', () => {
    render(<>{renderStars(3)}</>);
    
    const star1 = screen.getByTestId('star-1');
    const star3 = screen.getByTestId('star-3');
    const star4 = screen.getByTestId('star-4');
    const star5 = screen.getByTestId('star-5');

    expect(star1).toHaveStyle({ color: '#fbbf24' });
    expect(star3).toHaveStyle({ color: '#fbbf24' });
    expect(star4).toHaveStyle({ color: 'rgba(255, 255, 255, 0.15)' });
    expect(star5).toHaveStyle({ color: 'rgba(255, 255, 255, 0.15)' });
  });

  test('handles 0 stars correctly (all stars are inactive)', () => {
    render(<>{renderStars(0)}</>);
    const stars = screen.getAllByText('★');
    
    stars.forEach((star) => {
      expect(star).toHaveStyle({ color: 'rgba(255, 255, 255, 0.15)' });
    });
  });

  test('handles 5 stars correctly (all stars are active)', () => {
    render(<>{renderStars(5)}</>);
    const stars = screen.getAllByText('★');
    
    stars.forEach((star) => {
      expect(star).toHaveStyle({ color: '#fbbf24' });
    });
  });
});
