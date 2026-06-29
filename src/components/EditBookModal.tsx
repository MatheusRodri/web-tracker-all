import React, { useState, useEffect } from 'react';
import { deleteBook, updateBook, TrackedBook } from '@/lib/firestore';
import { BOOK_FORMATS } from '../utils/helpers';
import {
  ModalOverlay,
  ModalContent,
  CloseButton,
  ModalDetails,
  ShowHeader,
  ShowTitle,
  ShowYearMeta,
  FormSection,
  InputWrapper,
  InputLabel,
  SmallInput,
  FormRow,
  Select,
  StarRatingSelector,
  StarButton,
  ModalActions,
  ActionButton
} from '../app/styles';

interface EditBookModalProps {
  book: TrackedBook | null;
  onClose: () => void;
}

/**
 * EditBookModal component to edit or delete an existing book catalog record.
 * 
 * @param props - Component props containing the book data and close handler
 * @returns React modal component for editing a book
 */
export const EditBookModal: React.FC<EditBookModalProps> = ({ book, onClose }) => {
  // Form states
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookGenre, setBookGenre] = useState('');
  const [bookTotalPages, setBookTotalPages] = useState<number>(100);
  const [bookFormat, setBookFormat] = useState('Physical');
  const [bookCustomFormat, setBookCustomFormat] = useState('');
  const [bookStatus, setBookStatus] = useState<'PlanToRead' | 'Reading' | 'Read'>('PlanToRead');
  const [bookCurrentPage, setBookCurrentPage] = useState<number>(0);
  const [bookRating, setBookRating] = useState<number>(0);
  const [bookTimesRead, setBookTimesRead] = useState<number>(0);

  // Load book details when book prop changes
  useEffect(() => {
    if (book) {
      setBookTitle(book.title);
      setBookAuthor(book.author);
      setBookGenre(book.genre || '');
      setBookTotalPages(book.totalPages);
      
      if (BOOK_FORMATS.includes(book.format)) {
        setBookFormat(book.format);
        setBookCustomFormat('');
      } else {
        setBookFormat('Other');
        setBookCustomFormat(book.format);
      }

      setBookStatus(book.status);
      setBookCurrentPage(book.currentPage);
      setBookRating(book.rating);
      setBookTimesRead(book.timesRead);
    }
  }, [book]);

  /**
   * Adjusts timesRead and current page values dynamically based on status transition.
   * 
   * @param status - The selected book status
   */
  const handleStatusChange = (status: 'PlanToRead' | 'Reading' | 'Read') => {
    setBookStatus(status);
    if (status === 'PlanToRead') {
      setBookTimesRead(0);
      setBookCurrentPage(0);
    } else if (status === 'Read') {
      setBookCurrentPage(bookTotalPages);
      if (bookTimesRead === 0) {
        setBookTimesRead(1);
      }
    }
  };

  /**
   * Submits the updated book fields to Firestore.
   */
  const handleUpdate = async () => {
    if (!book || !bookTitle.trim()) return;

    const actualFormat = bookFormat === 'Other' ? bookCustomFormat : bookFormat;

    const updatedFields: Partial<Omit<TrackedBook, 'id' | 'userId' | 'createdAt'>> = {
      title: bookTitle,
      author: bookAuthor || 'Desconhecido',
      genre: bookGenre || 'N/A',
      totalPages: bookTotalPages || 1,
      format: actualFormat || 'Physical',
      status: bookStatus,
      currentPage: bookStatus === 'Read' ? bookTotalPages : bookCurrentPage,
      rating: bookRating,
      timesRead: bookTimesRead
    };

    try {
      await updateBook(book.id, updatedFields);
      onClose();
    } catch (err) {
      console.error('Failed to update book:', err);
    }
  };

  /**
   * Prompts the user and deletes the book catalog record from Firestore.
   */
  const handleDelete = async () => {
    if (!book) return;
    if (confirm(`Tem certeza que deseja remover "${book.title}" de sua lista?`)) {
      try {
        await deleteBook(book.id);
        onClose();
      } catch (err) {
        console.error('Failed to delete book:', err);
      }
    }
  };

  if (!book) return null;

  return (
    <ModalOverlay onClick={onClose} data-testid="edit-book-modal">
      <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <CloseButton onClick={onClose}>✕</CloseButton>
        <ModalDetails style={{ padding: '30px' }}>
          <ShowHeader>
            <ShowTitle style={{ color: 'var(--success)' }}>Editar Livro</ShowTitle>
            <ShowYearMeta>Ajuste as informações ou o progresso da sua leitura</ShowYearMeta>
          </ShowHeader>

          <FormSection style={{ border: 'none', paddingTop: 0 }}>
            <InputWrapper>
              <InputLabel htmlFor="edit-book-title">Título *</InputLabel>
              <SmallInput 
                type="text" 
                id="edit-book-title" 
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
              />
            </InputWrapper>

            <FormRow>
              <InputWrapper>
                <InputLabel htmlFor="edit-book-author">Autor</InputLabel>
                <SmallInput 
                  type="text" 
                  id="edit-book-author" 
                  value={bookAuthor}
                  onChange={(e) => setBookAuthor(e.target.value)}
                />
              </InputWrapper>

              <InputWrapper>
                <InputLabel htmlFor="edit-book-genre">Gênero</InputLabel>
                <SmallInput 
                  type="text" 
                  id="edit-book-genre" 
                  value={bookGenre}
                  onChange={(e) => setBookGenre(e.target.value)}
                />
              </InputWrapper>
            </FormRow>

            <FormRow>
              <InputWrapper>
                <InputLabel htmlFor="edit-book-pages">Total de Páginas</InputLabel>
                <SmallInput 
                  type="number" 
                  id="edit-book-pages" 
                  min="1"
                  value={bookTotalPages}
                  onChange={(e) => {
                    const pages = Math.max(1, parseInt(e.target.value, 10) || 1);
                    setBookTotalPages(pages);
                    if (bookStatus === 'Read') {
                      setBookCurrentPage(pages);
                    }
                  }}
                />
              </InputWrapper>

              <InputWrapper>
                <InputLabel htmlFor="edit-book-format">Formato / Mídia</InputLabel>
                <Select 
                  id="edit-book-format" 
                  value={bookFormat} 
                  onChange={(e) => setBookFormat(e.target.value)}
                >
                  {BOOK_FORMATS.map(f => (
                    <option key={f} value={f}>{f === 'Physical' ? 'Físico' : f}</option>
                  ))}
                  <option value="Other">Outro (Especificar)</option>
                </Select>
              </InputWrapper>
            </FormRow>

            {bookFormat === 'Other' && (
              <InputWrapper>
                <InputLabel htmlFor="edit-book-custom-format">Especificar Formato</InputLabel>
                <SmallInput 
                  type="text" 
                  id="edit-book-custom-format" 
                  value={bookCustomFormat}
                  onChange={(e) => setBookCustomFormat(e.target.value)}
                />
              </InputWrapper>
            )}

            <FormRow>
              <InputWrapper>
                <InputLabel htmlFor="edit-book-status">Status de Leitura</InputLabel>
                <Select 
                  id="edit-book-status" 
                  value={bookStatus} 
                  onChange={(e) => handleStatusChange(e.target.value as any)}
                >
                  <option value="PlanToRead">Quero Ler</option>
                  <option value="Reading">Lendo</option>
                  <option value="Read">Lido</option>
                </Select>
              </InputWrapper>

              {bookStatus === 'Reading' && (
                <InputWrapper>
                  <InputLabel htmlFor="edit-book-curr-page">Página Atual</InputLabel>
                  <SmallInput 
                    type="number" 
                    id="edit-book-curr-page" 
                    min="0"
                    max={bookTotalPages}
                    value={bookCurrentPage}
                    onChange={(e) => setBookCurrentPage(Math.min(Math.max(0, parseInt(e.target.value, 10) || 0), bookTotalPages))}
                  />
                </InputWrapper>
              )}
            </FormRow>

            <FormRow>
              {bookStatus === 'Read' && (
                <InputWrapper>
                  <InputLabel htmlFor="edit-book-times-read">Vezes Lido</InputLabel>
                  <SmallInput 
                    type="number" 
                    id="edit-book-times-read" 
                    min="0"
                    value={bookTimesRead}
                    onChange={(e) => setBookTimesRead(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  />
                </InputWrapper>
              )}

              <InputWrapper>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <InputLabel>Sua Nota</InputLabel>
                  {bookRating > 0 && (
                    <button 
                      type="button" 
                      onClick={() => setBookRating(0)}
                      style={{ background: 'none', border: 'none', color: 'var(--foreground-muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Limpar nota
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                  <StarRatingSelector>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarButton
                        key={star}
                        type="button"
                        $selected={star <= bookRating}
                        onClick={() => setBookRating(star)}
                      >
                        ★
                      </StarButton>
                    ))}
                  </StarRatingSelector>
                  <span style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)' }}>
                    {bookRating > 0 ? `${bookRating}/5` : 'Sem nota'}
                  </span>
                </div>
              </InputWrapper>
            </FormRow>

            <ModalActions style={{ justifyContent: 'space-between' }}>
              <ActionButton $variant="danger" type="button" onClick={handleDelete}>
                Remover Livro
              </ActionButton>
              <div style={{ display: 'flex', gap: '12px' }}>
                <ActionButton $variant="secondary" type="button" onClick={onClose}>
                  Cancelar
                </ActionButton>
                <ActionButton $variant="primary" type="button" style={{ background: 'var(--success)' }} onClick={handleUpdate} disabled={!bookTitle.trim()}>
                  Salvar Alterações
                </ActionButton>
              </div>
            </ModalActions>
          </FormSection>
        </ModalDetails>
      </ModalContent>
    </ModalOverlay>
  );
};
