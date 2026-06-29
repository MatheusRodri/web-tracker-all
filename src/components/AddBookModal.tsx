import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { addBook, TrackedBook } from '@/lib/firestore';
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

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * AddBookModal component to add a book to the tracking catalog.
 * 
 * @param props - Component props containing visibility state and close callback
 * @returns React modal component for adding a book
 */
export const AddBookModal: React.FC<AddBookModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

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

  // Reset form fields when modal closes or opens
  useEffect(() => {
    if (isOpen) {
      setBookTitle('');
      setBookAuthor('');
      setBookGenre('');
      setBookTotalPages(100);
      setBookFormat('Physical');
      setBookCustomFormat('');
      setBookStatus('PlanToRead');
      setBookCurrentPage(0);
      setBookRating(0);
      setBookTimesRead(0);
    }
  }, [isOpen]);

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
   * Submits the new book entry to Firestore database.
   */
  const handleSave = async () => {
    if (!user || !bookTitle.trim()) return;

    const actualFormat = bookFormat === 'Other' ? bookCustomFormat : bookFormat;

    const newBook: Omit<TrackedBook, 'id' | 'userId' | 'createdAt'> = {
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
      await addBook(user.uid, newBook);
      onClose();
    } catch (err) {
      console.error('Failed to add book:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose} data-testid="add-book-modal">
      <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <CloseButton onClick={onClose}>✕</CloseButton>
        <ModalDetails style={{ padding: '30px' }}>
          <ShowHeader>
            <ShowTitle style={{ color: 'var(--success)' }}>Adicionar Novo Livro</ShowTitle>
            <ShowYearMeta>Preencha os detalhes do livro para acompanhar sua leitura</ShowYearMeta>
          </ShowHeader>

          <FormSection style={{ border: 'none', paddingTop: 0 }}>
            <InputWrapper>
              <InputLabel htmlFor="add-book-title">Título *</InputLabel>
              <SmallInput 
                type="text" 
                id="add-book-title" 
                placeholder="Digite o título do livro"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
              />
            </InputWrapper>

            <FormRow>
              <InputWrapper>
                <InputLabel htmlFor="add-book-author">Autor</InputLabel>
                <SmallInput 
                  type="text" 
                  id="add-book-author" 
                  placeholder="Nome do autor"
                  value={bookAuthor}
                  onChange={(e) => setBookAuthor(e.target.value)}
                />
              </InputWrapper>

              <InputWrapper>
                <InputLabel htmlFor="add-book-genre">Gênero</InputLabel>
                <SmallInput 
                  type="text" 
                  id="add-book-genre" 
                  placeholder="Ex: Ficção, Fantasia..."
                  value={bookGenre}
                  onChange={(e) => setBookGenre(e.target.value)}
                />
              </InputWrapper>
            </FormRow>

            <FormRow>
              <InputWrapper>
                <InputLabel htmlFor="add-book-pages">Total de Páginas</InputLabel>
                <SmallInput 
                  type="number" 
                  id="add-book-pages" 
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
                <InputLabel htmlFor="add-book-format">Formato / Mídia</InputLabel>
                <Select 
                  id="add-book-format" 
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
                <InputLabel htmlFor="add-book-custom-format">Especificar Formato</InputLabel>
                <SmallInput 
                  type="text" 
                  id="add-book-custom-format" 
                  placeholder="Ex: Epub, Capa Dura..."
                  value={bookCustomFormat}
                  onChange={(e) => setBookCustomFormat(e.target.value)}
                />
              </InputWrapper>
            )}

            <FormRow>
              <InputWrapper>
                <InputLabel htmlFor="add-book-status">Status de Leitura</InputLabel>
                <Select 
                  id="add-book-status" 
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
                  <InputLabel htmlFor="add-book-curr-page">Página Atual</InputLabel>
                  <SmallInput 
                    type="number" 
                    id="add-book-curr-page" 
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
                  <InputLabel htmlFor="add-book-times-read">Vezes Lido</InputLabel>
                  <SmallInput 
                    type="number" 
                    id="add-book-times-read" 
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

            <ModalActions>
              <ActionButton $variant="secondary" type="button" onClick={onClose}>
                Cancelar
              </ActionButton>
              <ActionButton $variant="primary" type="button" style={{ background: 'var(--success)' }} onClick={handleSave} disabled={!bookTitle.trim()}>
                Adicionar Livro
              </ActionButton>
            </ModalActions>
          </FormSection>
        </ModalDetails>
      </ModalContent>
    </ModalOverlay>
  );
};
