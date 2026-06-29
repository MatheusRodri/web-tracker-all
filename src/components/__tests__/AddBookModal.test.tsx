import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddBookModal } from '../AddBookModal';
import { addBook } from '@/lib/firestore';

// Mock firestore and auth modules
jest.mock('@/lib/firestore', () => ({
  addBook: jest.fn().mockResolvedValue({}),
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'user-123' },
  }),
}));

describe('AddBookModal component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('does not render when isOpen is false', () => {
    render(<AddBookModal isOpen={false} onClose={jest.fn()} />);
    expect(screen.queryByTestId('add-book-modal')).not.toBeInTheDocument();
  });

  test('renders form fields when isOpen is true', () => {
    render(<AddBookModal isOpen={true} onClose={jest.fn()} />);
    
    expect(screen.getByTestId('add-book-modal')).toBeInTheDocument();
    expect(screen.getByLabelText(/Título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Autor/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Gênero/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Total de Páginas/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Formato \/ Mídia/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status de Leitura/i)).toBeInTheDocument();
  });

  test('submits form successfully with user inputs', async () => {
    const handleClose = jest.fn();
    render(<AddBookModal isOpen={true} onClose={handleClose} />);

    // Fill title
    fireEvent.change(screen.getByLabelText(/Título/i), { target: { value: 'O Alquimista' } });
    
    // Fill author
    fireEvent.change(screen.getByLabelText(/Autor/i), { target: { value: 'Paulo Coelho' } });

    // Fill pages
    fireEvent.change(screen.getByLabelText(/Total de Páginas/i), { target: { value: '170' } });

    // Select format
    fireEvent.change(screen.getByLabelText(/Formato \/ Mídia/i), { target: { value: 'Kindle' } });

    // Select status
    fireEvent.change(screen.getByLabelText(/Status de Leitura/i), { target: { value: 'Reading' } });

    // Click submit
    fireEvent.click(screen.getByRole('button', { name: /Adicionar Livro/i }));

    await waitFor(() => {
      expect(addBook).toHaveBeenCalledWith('user-123', {
        title: 'O Alquimista',
        author: 'Paulo Coelho',
        genre: 'N/A',
        totalPages: 170,
        format: 'Kindle',
        status: 'Reading',
        currentPage: 0,
        rating: 0,
        timesRead: 0
      });
    });

    expect(handleClose).toHaveBeenCalled();
  });
});
