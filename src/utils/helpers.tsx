import React from 'react';

/**
 * List of standard streaming platforms for show cataloging.
 */
export const STREAMING_PLATFORMS = [
  'Apple TV+',
  'Crunchyroll',
  'Disney+',
  'F1 TV',
  'GloboPlay',
  'HBO Max',
  'Netflix',
  'Paramount+',
  'Prime Video',
  'Universal+'
];

/**
 * List of standard book formats for reading progress tracking.
 */
export const BOOK_FORMATS = [
  'Physical',
  'Kindle',
  'PDF',
  'Audiobook'
];

/**
 * List of standard course platform providers.
 */
export const COURSE_PLATFORMS = [
  'Udemy', 
  'Coursera', 
  'YouTube', 
  'Alura', 
  'Asimov', 
  'Hashtag', 
  'Microsoft Learn', 
  'Pluralsight', 
  'Rocketseat', 
  'EBAC'
];

/**
 * Renders a list of star icon elements representing a rating out of 5.
 * 
 * @param rating - The rating score (0 to 5)
 * @returns Array of React span elements representing stars
 */
export const renderStars = (rating: number) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span 
        key={i} 
        style={{ color: i <= rating ? '#fbbf24' : 'rgba(255, 255, 255, 0.15)' }}
        data-testid={`star-${i}`}
      >
        ★
      </span>
    );
  }
  return stars;
};
