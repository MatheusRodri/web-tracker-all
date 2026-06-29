'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  subscribeToShows, 
  TrackedShow,
  subscribeToBooks,
  TrackedBook,
  subscribeToCourses,
  TrackedCourse
} from '@/lib/firestore';
import { OMDBMovie, OMBSearchResponse, OMBDetailResponse } from './api/search/route';
import { renderStars } from '../utils/helpers';

// Styled Components
import {
  Container,
  Header,
  Logo,
  UserActions,
  UserEmail,
  LogoutButton,
  MenuButton,
  MobileDropdownMenu,
  MainContent,
  CategoryTabsContainer,
  CategoryTabButton,
  SearchContainer,
  SearchInput,
  SuggestionsDropdown,
  SuggestionItem,
  SuggestionPoster,
  SuggestionInfo,
  SuggestionTitle,
  SuggestionMeta,
  ActionButton,
  FilterSection,
  TabList,
  TabButton,
  SortSelect,
  ShowsGrid,
  EmptyState,
  EmptyTitle,
  EmptyText,
  LocalSearchInput
} from './styles';

// Feature Components
import { ShowCard } from '../components/ShowCard';
import { BookCard } from '../components/BookCard';
import { CourseCard } from '../components/CourseCard';

// Modal Components
import { AddShowModal } from '../components/AddShowModal';
import { EditShowModal } from '../components/EditShowModal';
import { ImportShowsModal } from '../components/ImportShowsModal';
import { AddBookModal } from '../components/AddBookModal';
import { EditBookModal } from '../components/EditBookModal';
import { AddCourseModal } from '../components/AddCourseModal';
import { EditCourseModal } from '../components/EditCourseModal';

/**
 * Main application dashboard supporting multi-category tracking (Shows, Books, Courses),
 * with real-time Firestore sync, dynamic filters, custom styling, and edit modals.
 * 
 * @returns Dashboard interface view
 */
export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Categories & Lists State
  const [activeCategory, setActiveCategory] = useState<'shows' | 'books' | 'courses'>('shows');
  const [shows, setShows] = useState<TrackedShow[]>([]);
  const [books, setBooks] = useState<TrackedBook[]>([]);
  const [courses, setCourses] = useState<TrackedCourse[]>([]);

  // Show Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<OMDBMovie[]>([]);
  
  // Modals Visibility & Temp State
  const [isAddingShow, setIsAddingShow] = useState(false);
  const [addShowInitialData, setAddShowInitialData] = useState<Partial<TrackedShow> | null>(null);
  const [editingShow, setEditingShow] = useState<TrackedShow | null>(null);
  const [isImportingShows, setIsImportingShows] = useState(false);

  const [isAddingBook, setIsAddingBook] = useState(false);
  const [editingBook, setEditingBook] = useState<TrackedBook | null>(null);

  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState<TrackedCourse | null>(null);

  // Local filtering states
  const [activeTab, setActiveTab] = useState<string>('All');
  const [localSearch, setLocalSearch] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'watchOrder' | 'rating' | 'title'>('recent');
  const [typeFilter, setTypeFilter] = useState<'all' | 'movie' | 'series'>('all');

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Authentication redirection guard
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Firestore real-time synchronization on login
  useEffect(() => {
    if (!user) return;
    
    const unsubscribeShows = subscribeToShows(user.uid, (updatedShows) => {
      setShows(updatedShows);
    });

    const unsubscribeBooks = subscribeToBooks(user.uid, (updatedBooks) => {
      setBooks(updatedBooks);
    });

    const unsubscribeCourses = subscribeToCourses(user.uid, (updatedCourses) => {
      setCourses(updatedCourses);
    });

    return () => {
      unsubscribeShows();
      unsubscribeBooks();
      unsubscribeCourses();
    };
  }, [user]);

  // Handle active category tab switches
  const handleCategoryChange = (category: 'shows' | 'books' | 'courses') => {
    setActiveCategory(category);
    setActiveTab('All');
    setLocalSearch('');
  };

  /**
   * Triggers background search suggestion fetches with 300ms debounce.
   *
   * @param queryStr - Movie or series title search term
   */
  const handleSearchChange = (queryStr: string) => {
    setSearchQuery(queryStr);
    
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (!queryStr.trim()) {
      setSuggestions([]);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?s=${encodeURIComponent(queryStr)}`);
        if (response.ok) {
          const data: OMBSearchResponse = await response.json();
          if (data.Response === 'True' && data.Search) {
            setSuggestions(data.Search);
          } else {
            setSuggestions([]);
          }
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    }, 300);
  };

  /**
   * Retrieves full details for a selected show from the suggestions list.
   *
   * @param imdbID - The unique OMDB/Imdb identifier for the selected item
   */
  const handleSelectSuggestion = async (imdbID: string) => {
    setSearchQuery('');
    setSuggestions([]);
    
    try {
      const response = await fetch(`/api/search?i=${imdbID}`);
      if (response.ok) {
        const data: OMBDetailResponse = await response.json();
        if (data.Response === 'True') {
          // Build initial data from OMDb details
          const initialShow: Partial<TrackedShow> = {
            imdbID: data.imdbID,
            title: data.Title,
            type: data.Type === 'series' ? 'series' : 'movie',
            year: data.Year,
            genre: data.Genre,
            director: data.Director,
            runtime: data.Runtime,
            production: data.Production || 'N/A',
            country: data.Country,
            poster: data.Poster !== 'N/A' ? data.Poster : '/file.svg',
            seasonsCount: data.totalSeasons ? parseInt(data.totalSeasons, 10) || 1 : 1
          };

          setAddShowInitialData(initialShow);
          setIsAddingShow(true);
        }
      }
    } catch (err) {
      console.error('Error fetching show details:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Filter shows locally
  const filteredShows = shows
    .filter(show => {
      const matchesTab = activeTab === 'All' ? true : show.status === activeTab;
      const matchesType = typeFilter === 'all' ? true : show.type === typeFilter;
      const matchesSearch = show.title.toLowerCase().includes(localSearch.toLowerCase()) || 
                            show.genre.toLowerCase().includes(localSearch.toLowerCase()) ||
                            show.platform.toLowerCase().includes(localSearch.toLowerCase());
      return matchesTab && matchesType && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'watchOrder') {
        const orderA = a.watchOrder !== undefined && a.watchOrder !== null ? a.watchOrder : Infinity;
        const orderB = b.watchOrder !== undefined && b.watchOrder !== null ? b.watchOrder : Infinity;
        if (orderA !== orderB) return orderA - orderB;
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    });

  // Filter books locally
  const filteredBooks = books.filter(book => {
    const matchesTab = activeTab === 'All' ? true : book.status === activeTab;
    const matchesSearch = book.title.toLowerCase().includes(localSearch.toLowerCase()) || 
                          book.author.toLowerCase().includes(localSearch.toLowerCase()) ||
                          book.genre.toLowerCase().includes(localSearch.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Filter courses locally
  const filteredCourses = courses.filter(course => {
    const matchesTab = activeTab === 'All' ? true : course.status === activeTab;
    const matchesSearch = course.title.toLowerCase().includes(localSearch.toLowerCase()) || 
                          course.platform.toLowerCase().includes(localSearch.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getTabOptions = () => {
    if (activeCategory === 'shows') {
      return [
        { key: 'All', label: 'Todos', count: shows.length },
        { key: 'Unwatched', label: 'Não Assistido', count: shows.filter(s => s.status === 'Unwatched').length },
        { key: 'Watching', label: 'Assistindo', count: shows.filter(s => s.status === 'Watching').length },
        { key: 'Watched', label: 'Assistido', count: shows.filter(s => s.status === 'Watched').length }
      ];
    } else if (activeCategory === 'books') {
      return [
        { key: 'All', label: 'Todos', count: books.length },
        { key: 'PlanToRead', label: 'Quero Ler', count: books.filter(b => b.status === 'PlanToRead').length },
        { key: 'Reading', label: 'Lendo', count: books.filter(b => b.status === 'Reading').length },
        { key: 'Read', label: 'Lido', count: books.filter(b => b.status === 'Read').length }
      ];
    } else {
      return [
        { key: 'All', label: 'Todos', count: courses.length },
        { key: 'PlanToStart', label: 'Quero Começar', count: courses.filter(c => c.status === 'PlanToStart').length },
        { key: 'Studying', label: 'Estudando', count: courses.filter(c => c.status === 'Studying').length },
        { key: 'Completed', label: 'Concluído', count: courses.filter(c => c.status === 'Completed').length }
      ];
    }
  };

  if (loading || !user) {
    return (
      <Container style={{ justifyContent: 'center', alignItems: 'center' }}>
        <h2>Carregando Dashboard...</h2>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Logo>Tracker All</Logo>
        
        {/* Desktop actions */}
        <UserActions>
          <UserEmail>{user?.email}</UserEmail>
          <LogoutButton onClick={handleLogout}>Sair</LogoutButton>
        </UserActions>
        
        {/* Mobile menu toggle */}
        <MenuButton onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </MenuButton>
        
        {/* Mobile dropdown menu */}
        {menuOpen && (
          <MobileDropdownMenu>
            <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', wordBreak: 'break-all', textAlign: 'right' }}>
              {user?.email}
            </span>
            <LogoutButton 
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              style={{ width: '100%', marginTop: '4px' }}
            >
              Sair
            </LogoutButton>
          </MobileDropdownMenu>
        )}
      </Header>

      <MainContent>
        {/* Main Category Tabs Selector */}
        <CategoryTabsContainer>
          <CategoryTabButton 
            $active={activeCategory === 'shows'} 
            $category="shows"
            onClick={() => handleCategoryChange('shows')}
          >
            🎬 Shows
          </CategoryTabButton>
          <CategoryTabButton 
            $active={activeCategory === 'books'} 
            $category="books"
            onClick={() => handleCategoryChange('books')}
          >
            📚 Livros
          </CategoryTabButton>
          <CategoryTabButton 
            $active={activeCategory === 'courses'} 
            $category="courses"
            onClick={() => handleCategoryChange('courses')}
          >
            🎓 Cursos
          </CategoryTabButton>
        </CategoryTabsContainer>

        {/* Real-time search engine for Shows or Add button for manual entry categories */}
        {activeCategory === 'shows' ? (
          <div style={{ display: 'flex', gap: '12px', maxWidth: '800px', margin: '0 auto 20px', width: '100%', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <SearchContainer style={{ flex: '1 1 300px', margin: 0 }}>
              <SearchInput
                type="text"
                placeholder="Pesquise filmes ou séries para adicionar..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {suggestions.length > 0 && (
                <SuggestionsDropdown>
                  {suggestions.map((suggestion) => (
                    <SuggestionItem
                      key={suggestion.imdbID}
                      onClick={() => handleSelectSuggestion(suggestion.imdbID)}
                    >
                      <SuggestionPoster 
                        src={suggestion.Poster !== 'N/A' ? suggestion.Poster : '/file.svg'} 
                        alt={suggestion.Title} 
                      />
                      <SuggestionInfo>
                        <SuggestionTitle>{suggestion.Title}</SuggestionTitle>
                        <SuggestionMeta>
                          {suggestion.Year} • {suggestion.Type === 'series' ? 'Série' : 'Filme'}
                        </SuggestionMeta>
                      </SuggestionInfo>
                    </SuggestionItem>
                  ))}
                </SuggestionsDropdown>
              )}
            </SearchContainer>
            <ActionButton 
              $variant="primary"
              style={{ width: 'auto', display: 'flex', gap: '8px', padding: '12px 20px', height: '48px', whiteSpace: 'nowrap' }}
              onClick={() => {
                setAddShowInitialData(null);
                setIsAddingShow(true);
              }}
            >
              ＋ Adicionar Manual
            </ActionButton>
            <ActionButton 
              $variant="secondary"
              style={{ width: 'auto', display: 'flex', gap: '8px', padding: '12px 20px', height: '48px', whiteSpace: 'nowrap' }}
              onClick={() => {
                setIsImportingShows(true);
              }}
            >
              📥 Importar Lista
            </ActionButton>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ActionButton 
              $variant="primary" 
              style={{ 
                background: activeCategory === 'books' ? 'var(--success)' : 'var(--accent)',
                maxWidth: '300px',
                width: '100%',
                justifyContent: 'center'
              }}
              onClick={() => {
                if (activeCategory === 'books') {
                  setIsAddingBook(true);
                } else {
                  setIsAddingCourse(true);
                }
              }}
            >
              {activeCategory === 'books' ? '＋ Adicionar Novo Livro' : '＋ Adicionar Novo Curso'}
            </ActionButton>
          </div>
        )}

        {/* Dashboard listings filters */}
        <FilterSection>
          <TabList>
            {getTabOptions().map((opt) => (
              <TabButton 
                key={opt.key}
                $active={activeTab === opt.key} 
                onClick={() => setActiveTab(opt.key)}
              >
                {opt.label} ({opt.count})
              </TabButton>
            ))}
          </TabList>

          {activeCategory === 'shows' && (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)' }}>Tipo:</span>
                <SortSelect
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                >
                  <option value="all">Todos</option>
                  <option value="movie">Filmes</option>
                  <option value="series">Séries</option>
                </SortSelect>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)' }}>Ordenar:</span>
                <SortSelect 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="recent">Adicionados Recentemente</option>
                  <option value="watchOrder">Ordem Cronológica</option>
                  <option value="rating">Maior Nota</option>
                  <option value="title">Título (A-Z)</option>
                </SortSelect>
              </div>
            </div>
          )}

          <LocalSearchInput 
            type="text" 
            placeholder="Filtrar nesta lista..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </FilterSection>

        {/* SHOWS GRID */}
        {activeCategory === 'shows' && (
          filteredShows.length > 0 ? (
            <ShowsGrid>
              {filteredShows.map((show) => (
                <ShowCard 
                  key={show.id} 
                  show={show} 
                  onClick={() => setEditingShow(show)} 
                />
              ))}
            </ShowsGrid>
          ) : (
            <EmptyState>
              <EmptyTitle>Nenhum show encontrado</EmptyTitle>
              <EmptyText>
                {shows.length === 0
                  ? 'Sua lista de shows está vazia! Digite o nome de um filme ou série no campo de busca acima para registrar seu primeiro show.'
                  : 'Nenhum filme ou série corresponde aos filtros ativos no momento.'}
              </EmptyText>
            </EmptyState>
          )
        )}

        {/* BOOKS GRID */}
        {activeCategory === 'books' && (
          filteredBooks.length > 0 ? (
            <ShowsGrid>
              {filteredBooks.map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  onClick={() => setEditingBook(book)} 
                />
              ))}
            </ShowsGrid>
          ) : (
            <EmptyState>
              <EmptyTitle>Nenhum livro encontrado</EmptyTitle>
              <EmptyText>
                {books.length === 0
                  ? 'Sua lista de livros está vazia! Clique no botão "Adicionar Novo Livro" acima para começar a gerenciar suas leituras.'
                  : 'Nenhum livro corresponde aos filtros ativos no momento.'}
              </EmptyText>
            </EmptyState>
          )
        )}

        {/* COURSES GRID */}
        {activeCategory === 'courses' && (
          filteredCourses.length > 0 ? (
            <ShowsGrid>
              {filteredCourses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  onClick={() => setEditingCourse(course)} 
                />
              ))}
            </ShowsGrid>
          ) : (
            <EmptyState>
              <EmptyTitle>Nenhum curso encontrado</EmptyTitle>
              <EmptyText>
                {courses.length === 0
                  ? 'Sua lista de cursos está vazia! Clique no botão "Adicionar Novo Curso" acima para registrar seus estudos.'
                  : 'Nenhum curso corresponde aos filtros ativos no momento.'}
              </EmptyText>
            </EmptyState>
          )
        )}
      </MainContent>

      {/* =======================================================================
         MODALS RENDER
         ======================================================================= */}
      
      {/* Show Modals */}
      <AddShowModal 
        isOpen={isAddingShow}
        onClose={() => {
          setIsAddingShow(false);
          setAddShowInitialData(null);
        }}
        initialData={addShowInitialData}
      />

      <EditShowModal 
        show={editingShow}
        onClose={() => setEditingShow(null)}
      />

      <ImportShowsModal 
        isOpen={isImportingShows}
        onClose={() => setIsImportingShows(false)}
      />

      {/* Book Modals */}
      <AddBookModal 
        isOpen={isAddingBook}
        onClose={() => setIsAddingBook(false)}
      />

      <EditBookModal 
        book={editingBook}
        onClose={() => setEditingBook(null)}
      />

      {/* Course Modals */}
      <AddCourseModal 
        isOpen={isAddingCourse}
        onClose={() => setIsAddingCourse(false)}
      />

      <EditCourseModal 
        course={editingCourse}
        onClose={() => setEditingCourse(null)}
      />
    </Container>
  );
}
