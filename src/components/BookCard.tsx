import React from 'react';
import { TrackedBook } from '@/lib/firestore';
import { renderStars } from '../utils/helpers';
import {
  BookCardContainer,
  BookCoverPlaceholder,
  BookCoverTitle,
  BookCoverAuthor,
  CardBody,
  CardMeta,
  BookStatusBadge,
  PlatformBadge,
  ProgressBarContainer,
  ProgressBarFill,
  RatingStars
} from '../app/styles';

interface BookCardProps {
  book: TrackedBook;
  onClick: () => void;
}

/**
 * BookCard component displaying details of a tracked book in a card format with a visual progress bar.
 * 
 * @param props - Component props containing the book data and click handler
 * @returns React component rendering the book card
 */
export const BookCard: React.FC<BookCardProps> = ({ book, onClick }) => {
  const progressPercentage = book.totalPages > 0 
    ? Math.round((book.currentPage / book.totalPages) * 100) 
    : 0;

  return (
    <BookCardContainer onClick={onClick} data-testid="book-card">
      <BookCoverPlaceholder>
        <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 'bold', textTransform: 'uppercase' }}>
          {book.genre}
        </span>
        <BookCoverTitle>{book.title}</BookCoverTitle>
        <BookCoverAuthor>{book.author}</BookCoverAuthor>
      </BookCoverPlaceholder>
      <CardBody>
        <CardMeta>
          <BookStatusBadge $status={book.status}>
            {book.status === 'Read' ? 'Lido' : 
             book.status === 'Reading' ? 'Lendo' : 'Quero Ler'}
          </BookStatusBadge>
          <PlatformBadge>{book.format}</PlatformBadge>
        </CardMeta>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: 'auto' }}>
          <CardMeta>
            <span>Progresso</span>
            <span style={{ fontWeight: 'bold' }}>{progressPercentage}%</span>
          </CardMeta>
          <ProgressBarContainer>
            <ProgressBarFill $progress={progressPercentage} $color="var(--success)" />
          </ProgressBarContainer>
          <CardMeta style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '4px' }}>
            <span>Pág. {book.currentPage} / {book.totalPages}</span>
            {book.timesRead > 1 && <span>Lido {book.timesRead}x</span>}
          </CardMeta>
        </div>
        <CardMeta style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px' }}>
          <RatingStars>{renderStars(book.rating)}</RatingStars>
        </CardMeta>
      </CardBody>
    </BookCardContainer>
  );
};
