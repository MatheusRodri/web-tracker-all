'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '@/context/AuthContext';
import { 
  addShow, 
  updateShow, 
  deleteShow, 
  subscribeToShows, 
  TrackedShow 
} from '@/lib/firestore';
import { OMBDetailResponse, OMDBMovie, OMBSearchResponse } from './api/search/route';

// CSS Keyframes for smooth animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 5px var(--accent-glow); }
  50% { box-shadow: 0 0 15px var(--accent); }
  100% { box-shadow: 0 0 5px var(--accent-glow); }
`;

const Container = styled.div`
  min-height: 100vh;
  background-color: #07070a;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  font-family: var(--font-sans);
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 40px;
  background: rgba(15, 15, 20, 0.7);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #ffffff 30%, var(--primary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
`;

const UserActions = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const UserEmail = styled.span`
  color: var(--foreground-muted);
  font-size: 0.9rem;
`;

const LogoutButton = styled.button`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--danger);
    color: #ffffff;
    border-color: var(--danger);
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 40px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

const SearchInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 14px 20px;
  color: #ffffff;
  font-size: 1.05rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-glow), 0 4px 20px rgba(0, 0, 0, 0.3);
    background: rgba(255, 255, 255, 0.08);
  }
`;

const SuggestionsDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: rgba(15, 15, 20, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  max-height: 350px;
  overflow-y: auto;
  z-index: 20;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(15px);
`;

const SuggestionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const SuggestionPoster = styled.img`
  width: 40px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  background-color: #1a1a24;
`;

const SuggestionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SuggestionTitle = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
`;

const SuggestionMeta = styled.div`
  font-size: 0.8rem;
  color: var(--foreground-muted);
  text-transform: capitalize;
`;

const FilterSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 10px;
`;

const TabList = styled.div`
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.03);
  padding: 4px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const TabButton = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.08)' : 'transparent'};
  border: none;
  border-radius: 6px;
  color: ${props => props.$active ? '#ffffff' : 'var(--foreground-muted)'};
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #ffffff;
    background: ${props => props.$active ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)'};
  }
`;

const LocalSearchInput = styled.input`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 8px 14px;
  color: #ffffff;
  font-size: 0.9rem;
  max-width: 250px;
  width: 100%;

  &:focus {
    outline: none;
    border-color: var(--primary);
    background: rgba(255, 255, 255, 0.06);
  }
`;

const ShowsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
  animation: ${fadeIn} 0.4s ease;
`;

const ShowCard = styled.div`
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;

  &:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6);
  }
`;

const CardPoster = styled.img`
  width: 100%;
  height: 280px;
  object-fit: cover;
  background-color: #13131c;
`;

const CardBody = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
`;

const CardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.4;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 2.8rem;
`;

const CardMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--foreground-muted);
`;

const CardProgress = styled.div`
  font-size: 0.85rem;
  color: var(--accent);
  font-weight: 600;
`;

const StatusBadge = styled.span<{ $status: 'Unwatched' | 'Watching' | 'Watched' }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  background-color: ${props => 
    props.$status === 'Watched' ? 'rgba(16, 185, 129, 0.15)' : 
    props.$status === 'Watching' ? 'rgba(6, 182, 212, 0.15)' : 
    'rgba(245, 158, 11, 0.15)'};
    
  color: ${props => 
    props.$status === 'Watched' ? '#34d399' : 
    props.$status === 'Watching' ? '#22d3ee' : 
    '#fbbf24'};
    
  border: 1px solid ${props => 
    props.$status === 'Watched' ? 'rgba(16, 185, 129, 0.3)' : 
    props.$status === 'Watching' ? 'rgba(6, 182, 212, 0.3)' : 
    'rgba(245, 158, 11, 0.3)'};

  ${props => props.$status === 'Watching' && `
    animation: ${pulseGlow} 2s infinite ease-in-out;
  `}
`;

const PlatformBadge = styled.span`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 0.75rem;
  color: var(--foreground-muted);
`;

const RatingStars = styled.div`
  display: flex;
  gap: 2px;
  color: #fbbf24;
  font-size: 0.9rem;
`;

// Modal overlay and container
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 20px;
  overflow-y: auto;
`;

const ModalContent = styled.div`
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${fadeIn} 0.3s ease;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #ffffff;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.1rem;
  z-index: 5;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(1.05);
  }
`;

const ModalGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  
  @media (min-width: 600px) {
    grid-template-columns: 280px 1fr;
  }
`;

const ModalPosterContainer = styled.div`
  position: relative;
  background-color: #101017;
  display: flex;
  justify-content: center;
  align-items: center;
  
  @media (max-width: 599px) {
    max-height: 300px;
  }
`;

const ModalPoster = styled.img`
  width: 100%;
  height: 100%;
  max-height: 500px;
  object-fit: cover;
  
  @media (max-width: 599px) {
    width: auto;
    max-height: 300px;
  }
`;

const ModalDetails = styled.div`
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ShowHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ShowTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1.2;
`;

const ShowYearMeta = styled.span`
  font-size: 0.95rem;
  color: var(--foreground-muted);
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  padding: 16px;
  border-radius: 8px;
  font-size: 0.85rem;
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  span:first-child {
    color: var(--foreground-muted);
    font-size: 0.75rem;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  span:last-child {
    font-weight: 600;
  }
`;

const FormSection = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InputLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--foreground);
  letter-spacing: 0.5px;
`;

const Select = styled.select`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 14px;
  color: #ffffff;
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }

  option {
    background-color: #0d0d13;
  }
`;

const SmallInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 14px;
  color: #ffffff;
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const StarRatingSelector = styled.div`
  display: flex;
  gap: 6px;
`;

const StarButton = styled.button<{ $selected: boolean }>`
  background: none;
  border: none;
  font-size: 1.4rem;
  color: ${props => props.$selected ? '#fbbf24' : 'rgba(255, 255, 255, 0.2)'};
  cursor: pointer;
  transition: transform 0.1s ease;
  padding: 0;

  &:hover {
    transform: scale(1.15);
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' | 'secondary' }>`
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  background-color: ${props => 
    props.$variant === 'primary' ? 'var(--primary)' : 
    props.$variant === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 
    'rgba(255, 255, 255, 0.05)'};
    
  color: ${props => 
    props.$variant === 'primary' ? '#ffffff' : 
    props.$variant === 'danger' ? '#ef4444' : 
    '#ffffff'};

  border: 1px solid ${props => 
    props.$variant === 'primary' ? 'transparent' : 
    props.$variant === 'danger' ? 'rgba(239, 68, 68, 0.2)' : 
    'rgba(255, 255, 255, 0.1)'};

  &:hover {
    transform: translateY(-1px);
    background-color: ${props => 
      props.$variant === 'primary' ? '#7c3aed' : 
      props.$variant === 'danger' ? 'var(--danger)' : 
      'rgba(255, 255, 255, 0.1)'};
    color: #ffffff;
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 40px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 500px;
  margin: 40px auto 0;
`;

const EmptyTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
`;

const EmptyText = styled.p`
  color: var(--foreground-muted);
  font-size: 0.9rem;
  line-height: 1.6;
`;

/**
 * Renders simple star count component for show cards.
 *
 * @param rating - Rating score from 1 to 5
 * @returns Array of JSX elements containing stars
 */
const renderStars = (rating: number) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(<span key={i}>{i <= rating ? '★' : '☆'}</span>);
  }
  return stars;
};

/**
 * Main application dashboard containing list filters, tracked items grid,
 * interactive search bar with suggestions, and detail modals.
 *
 * @returns Dashboard interface view
 */
export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // State management
  const [shows, setShows] = useState<TrackedShow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<OMDBMovie[]>([]);
  const [selectedOMDBShow, setSelectedOMDBShow] = useState<OMBDetailResponse | null>(null);
  const [editingShow, setEditingShow] = useState<TrackedShow | null>(null);
  
  // Local filtering states
  const [activeTab, setActiveTab] = useState<'All' | 'Unwatched' | 'Watching' | 'Watched'>('All');
  const [localSearch, setLocalSearch] = useState('');
  
  // Form fields for saving/editing
  const [status, setStatus] = useState<'Unwatched' | 'Watching' | 'Watched'>('Unwatched');
  const [rating, setRating] = useState<number>(3);
  const [platform, setPlatform] = useState('Netflix');
  const [customPlatform, setCustomPlatform] = useState('');
  const [timesWatched, setTimesWatched] = useState<number>(1);
  const [currentSeason, setCurrentSeason] = useState<number>(1);
  const [currentEpisode, setCurrentEpisode] = useState<number>(1);
  const [seasonsCount, setSeasonsCount] = useState<number>(1);
  const [episodesCount, setEpisodesCount] = useState<number>(1);
  
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
    
    const unsubscribe = subscribeToShows(user.uid, (updatedShows) => {
      setShows(updatedShows);
    });

    return () => unsubscribe();
  }, [user]);

  /**
   * Triggers background search suggestion fetches with 300ms debounce.
   *
   * @param query - Movie or series title search term
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
   * Resets form values to defaults.
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
          setSelectedOMDBShow(data);
          // Set default form values
          setStatus('Unwatched');
          setRating(3);
          setPlatform('Netflix');
          setCustomPlatform('');
          setTimesWatched(1);
          setCurrentSeason(1);
          setCurrentEpisode(1);
          setSeasonsCount(data.totalSeasons ? parseInt(data.totalSeasons, 10) || 1 : 1);
          setEpisodesCount(12); // standard default
        }
      }
    } catch (err) {
      console.error('Error fetching show details:', err);
    }
  };

  /**
   * Submits and saves the new movie or series to Firestore.
   */
  const handleSaveShow = async () => {
    if (!user || !selectedOMDBShow) return;

    const actualPlatform = platform === 'Other' ? customPlatform : platform;

    const newShow: Omit<TrackedShow, 'id' | 'userId' | 'createdAt'> = {
      imdbID: selectedOMDBShow.imdbID,
      title: selectedOMDBShow.Title,
      type: selectedOMDBShow.Type as 'movie' | 'series',
      year: selectedOMDBShow.Year,
      poster: selectedOMDBShow.Poster !== 'N/A' ? selectedOMDBShow.Poster : '/file.svg',
      genre: selectedOMDBShow.Genre,
      director: selectedOMDBShow.Director,
      runtime: selectedOMDBShow.Runtime,
      production: selectedOMDBShow.Production || 'N/A',
      country: selectedOMDBShow.Country,
      status,
      rating,
      platform: actualPlatform || 'N/A',
      timesWatched,
      ...(selectedOMDBShow.Type === 'series' ? {
        seasonsCount,
        episodesCount,
        currentSeason,
        currentEpisode
      } : {})
    };

    try {
      await addShow(user.uid, newShow);
      setSelectedOMDBShow(null);
    } catch (err) {
      console.error('Failed to save show:', err);
    }
  };

  /**
   * Populates form fields with the selected show data to initiate editing.
   *
   * @param show - TrackedShow entity to update
   */
  const handleStartEdit = (show: TrackedShow) => {
    setEditingShow(show);
    setStatus(show.status);
    setRating(show.rating);
    
    // Check if platform is a standard option
    const standardPlatforms = ['Netflix', 'AppleTv', 'Prime Video', 'Disney+', 'HBO Max', 'Paramount+'];
    if (standardPlatforms.includes(show.platform)) {
      setPlatform(show.platform);
      setCustomPlatform('');
    } else {
      setPlatform('Other');
      setCustomPlatform(show.platform);
    }

    setTimesWatched(show.timesWatched);
    if (show.type === 'series') {
      setCurrentSeason(show.currentSeason || 1);
      setCurrentEpisode(show.currentEpisode || 1);
      setSeasonsCount(show.seasonsCount || 1);
      setEpisodesCount(show.episodesCount || 1);
    }
  };

  /**
   * Applies modifications to the tracked show item in Firestore.
   */
  const handleUpdateShow = async () => {
    if (!editingShow) return;

    const actualPlatform = platform === 'Other' ? customPlatform : platform;

    const updatedFields: Partial<Omit<TrackedShow, 'id' | 'userId' | 'createdAt'>> = {
      status,
      rating,
      platform: actualPlatform || 'N/A',
      timesWatched,
      ...(editingShow.type === 'series' ? {
        currentSeason,
        currentEpisode,
        seasonsCount,
        episodesCount
      } : {})
    };

    try {
      await updateShow(editingShow.id, updatedFields);
      setEditingShow(null);
    } catch (err) {
      console.error('Failed to update show:', err);
    }
  };

  /**
   * Permanently deletes a show document.
   */
  const handleDeleteShow = async () => {
    if (!editingShow) return;
    if (confirm(`Tem certeza que deseja remover "${editingShow.title}" de sua lista?`)) {
      try {
        await deleteShow(editingShow.id);
        setEditingShow(null);
      } catch (err) {
        console.error('Failed to delete show:', err);
      }
    }
  };

  /**
   * Handles user logout.
   */
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Helper local filters application
  const filteredShows = shows.filter(show => {
    const matchesTab = activeTab === 'All' ? true : show.status === activeTab;
    const matchesSearch = show.title.toLowerCase().includes(localSearch.toLowerCase()) || 
                          show.genre.toLowerCase().includes(localSearch.toLowerCase());
    return matchesTab && matchesSearch;
  });

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
        <Logo>Tracker Shows</Logo>
        <UserActions>
          <UserEmail>{user.email}</UserEmail>
          <LogoutButton onClick={handleLogout}>Sair</LogoutButton>
        </UserActions>
      </Header>

      <MainContent>
        {/* Real-time search engine */}
        <SearchContainer>
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

        {/* Dashboard listings filters */}
        <FilterSection>
          <TabList>
            <TabButton 
              $active={activeTab === 'All'} 
              onClick={() => setActiveTab('All')}
            >
              Todos ({shows.length})
            </TabButton>
            <TabButton 
              $active={activeTab === 'Unwatched'} 
              onClick={() => setActiveTab('Unwatched')}
            >
              Não Assistido ({shows.filter(s => s.status === 'Unwatched').length})
            </TabButton>
            <TabButton 
              $active={activeTab === 'Watching'} 
              onClick={() => setActiveTab('Watching')}
            >
              Assistindo ({shows.filter(s => s.status === 'Watching').length})
            </TabButton>
            <TabButton 
              $active={activeTab === 'Watched'} 
              onClick={() => setActiveTab('Watched')}
            >
              Assistido ({shows.filter(s => s.status === 'Watched').length})
            </TabButton>
          </TabList>

          <LocalSearchInput
            type="text"
            placeholder="Filtrar por título..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </FilterSection>

        {/* Tracked cards grid */}
        {filteredShows.length > 0 ? (
          <ShowsGrid>
            {filteredShows.map((show) => (
              <ShowCard key={show.id} onClick={() => handleStartEdit(show)}>
                <CardPoster src={show.poster} alt={show.title} />
                <CardBody>
                  <CardTitle>{show.title}</CardTitle>
                  <CardMeta>
                    <StatusBadge $status={show.status}>
                      {show.status === 'Watched' ? 'Assistido' : 
                       show.status === 'Watching' ? 'Assistindo' : 'Não Assistido'}
                    </StatusBadge>
                    <PlatformBadge>{show.platform}</PlatformBadge>
                  </CardMeta>
                  <CardMeta style={{ marginTop: 'auto' }}>
                    <RatingStars>{renderStars(show.rating)}</RatingStars>
                    {show.type === 'series' ? (
                      <CardProgress>
                        T{show.currentSeason || 1}: Ep{show.currentEpisode || 1}
                      </CardProgress>
                    ) : (
                      show.timesWatched > 1 && (
                        <CardProgress style={{ color: 'var(--primary)' }}>
                          Visto {show.timesWatched}x
                        </CardProgress>
                      )
                    )}
                  </CardMeta>
                </CardBody>
              </ShowCard>
            ))}
          </ShowsGrid>
        ) : (
          <EmptyState>
            <EmptyTitle>Nenhum item encontrado</EmptyTitle>
            <EmptyText>
              {shows.length === 0
                ? 'Sua lista está vazia! Digite o nome de um filme ou série no campo de busca acima para registrar sua primeira visualização.'
                : 'Nenhum filme ou série corresponde aos filtros ativos no momento.'}
            </EmptyText>
          </EmptyState>
        )}
      </MainContent>

      {/* MODAL: Adding new show details */}
      {selectedOMDBShow && (
        <ModalOverlay onClick={() => setSelectedOMDBShow(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setSelectedOMDBShow(null)}>✕</CloseButton>
            <ModalGrid>
              <ModalPosterContainer>
                <ModalPoster 
                  src={selectedOMDBShow.Poster !== 'N/A' ? selectedOMDBShow.Poster : '/file.svg'} 
                  alt={selectedOMDBShow.Title} 
                />
              </ModalPosterContainer>
              <ModalDetails>
                <ShowHeader>
                  <ShowTitle>{selectedOMDBShow.Title}</ShowTitle>
                  <ShowYearMeta>
                    {selectedOMDBShow.Year} • {selectedOMDBShow.Type === 'series' ? 'Série' : 'Filme'}
                  </ShowYearMeta>
                </ShowHeader>

                <MetaGrid>
                  <MetaItem>
                    <span>Diretor</span>
                    <span>{selectedOMDBShow.Director}</span>
                  </MetaItem>
                  <MetaItem>
                    <span>Gênero</span>
                    <span>{selectedOMDBShow.Genre}</span>
                  </MetaItem>
                  <MetaItem>
                    <span>País</span>
                    <span>{selectedOMDBShow.Country}</span>
                  </MetaItem>
                  <MetaItem>
                    <span>Duração</span>
                    <span>{selectedOMDBShow.Runtime}</span>
                  </MetaItem>
                  <MetaItem style={{ gridColumn: 'span 2' }}>
                    <span>Produtoras</span>
                    <span>{selectedOMDBShow.Production || 'N/A'}</span>
                  </MetaItem>
                </MetaGrid>

                <FormSection>
                  <FormRow>
                    <InputWrapper>
                      <InputLabel htmlFor="add-status">Status</InputLabel>
                      <Select 
                        id="add-status" 
                        value={status} 
                        onChange={(e) => setStatus(e.target.value as any)}
                      >
                        <option value="Unwatched">Não Assistido</option>
                        <option value="Watching">Assistindo</option>
                        <option value="Watched">Assistido</option>
                      </Select>
                    </InputWrapper>

                    <InputWrapper>
                      <InputLabel>Nota (1 a 5 estrelas)</InputLabel>
                      <StarRatingSelector>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarButton
                            key={star}
                            type="button"
                            $selected={star <= rating}
                            onClick={() => setRating(star)}
                          >
                            ★
                          </StarButton>
                        ))}
                      </StarRatingSelector>
                    </InputWrapper>
                  </FormRow>

                  <FormRow>
                    <InputWrapper>
                      <InputLabel htmlFor="add-platform">Onde assistir / Plataforma</InputLabel>
                      <Select 
                        id="add-platform" 
                        value={platform} 
                        onChange={(e) => setPlatform(e.target.value)}
                      >
                        <option value="Netflix">Netflix</option>
                        <option value="AppleTv">Apple TV+</option>
                        <option value="Prime Video">Prime Video</option>
                        <option value="Disney+">Disney+</option>
                        <option value="HBO Max">HBO Max</option>
                        <option value="Paramount+">Paramount+</option>
                        <option value="Other">Outro (Digitar)</option>
                      </Select>
                    </InputWrapper>

                    {platform === 'Other' && (
                      <InputWrapper>
                        <InputLabel htmlFor="add-custom-platform">Especificar Plataforma</InputLabel>
                        <SmallInput 
                          type="text" 
                          id="add-custom-platform" 
                          placeholder="Digite o nome da plataforma"
                          value={customPlatform}
                          onChange={(e) => setCustomPlatform(e.target.value)}
                        />
                      </InputWrapper>
                    )}
                  </FormRow>

                  <FormRow>
                    <InputWrapper>
                      <InputLabel htmlFor="add-times-watched">Quantidade de vezes assistida</InputLabel>
                      <SmallInput 
                        type="number" 
                        id="add-times-watched" 
                        min="1"
                        value={timesWatched}
                        onChange={(e) => setTimesWatched(parseInt(e.target.value, 10) || 1)}
                      />
                    </InputWrapper>
                  </FormRow>

                  {/* Series specifics */}
                  {selectedOMDBShow.Type === 'series' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '20px' }}>
                      <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--accent)' }}>Progresso da Série</h4>
                      <FormRow>
                        <InputWrapper>
                          <InputLabel htmlFor="add-seasons">Total de Temporadas</InputLabel>
                          <SmallInput 
                            type="number" 
                            id="add-seasons" 
                            min="1"
                            value={seasonsCount}
                            onChange={(e) => setSeasonsCount(parseInt(e.target.value, 10) || 1)}
                          />
                        </InputWrapper>

                        <InputWrapper>
                          <InputLabel htmlFor="add-episodes">Total de Episódios (Estimado)</InputLabel>
                          <SmallInput 
                            type="number" 
                            id="add-episodes" 
                            min="1"
                            value={episodesCount}
                            onChange={(e) => setEpisodesCount(parseInt(e.target.value, 10) || 1)}
                          />
                        </InputWrapper>
                      </FormRow>

                      {status !== 'Unwatched' && (
                        <FormRow>
                          <InputWrapper>
                            <InputLabel htmlFor="add-cur-season">Temporada Atual</InputLabel>
                            <SmallInput 
                              type="number" 
                              id="add-cur-season" 
                              min="1"
                              max={seasonsCount}
                              value={currentSeason}
                              onChange={(e) => setCurrentSeason(parseInt(e.target.value, 10) || 1)}
                            />
                          </InputWrapper>

                          <InputWrapper>
                            <InputLabel htmlFor="add-cur-episode">Episódio Atual</InputLabel>
                            <SmallInput 
                              type="number" 
                              id="add-cur-episode" 
                              min="1"
                              value={currentEpisode}
                              onChange={(e) => setCurrentEpisode(parseInt(e.target.value, 10) || 1)}
                            />
                          </InputWrapper>
                        </FormRow>
                      )}
                    </div>
                  )}

                  <ModalActions>
                    <ActionButton $variant="secondary" onClick={() => setSelectedOMDBShow(null)}>
                      Cancelar
                    </ActionButton>
                    <ActionButton $variant="primary" onClick={handleSaveShow}>
                      Adicionar à Lista
                    </ActionButton>
                  </ModalActions>
                </FormSection>
              </ModalDetails>
            </ModalGrid>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* MODAL: Editing tracked show */}
      {editingShow && (
        <ModalOverlay onClick={() => setEditingShow(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setEditingShow(null)}>✕</CloseButton>
            <ModalGrid>
              <ModalPosterContainer>
                <ModalPoster src={editingShow.poster} alt={editingShow.title} />
              </ModalPosterContainer>
              <ModalDetails>
                <ShowHeader>
                  <ShowTitle>{editingShow.title}</ShowTitle>
                  <ShowYearMeta>
                    {editingShow.year} • {editingShow.type === 'series' ? 'Série' : 'Filme'}
                  </ShowYearMeta>
                </ShowHeader>

                <MetaGrid>
                  <MetaItem>
                    <span>Diretor</span>
                    <span>{editingShow.director}</span>
                  </MetaItem>
                  <MetaItem>
                    <span>Gênero</span>
                    <span>{editingShow.genre}</span>
                  </MetaItem>
                  <MetaItem>
                    <span>País</span>
                    <span>{editingShow.country}</span>
                  </MetaItem>
                  <MetaItem>
                    <span>Duração</span>
                    <span>{editingShow.runtime}</span>
                  </MetaItem>
                  <MetaItem style={{ gridColumn: 'span 2' }}>
                    <span>Produtoras</span>
                    <span>{editingShow.production}</span>
                  </MetaItem>
                </MetaGrid>

                <FormSection>
                  <FormRow>
                    <InputWrapper>
                      <InputLabel htmlFor="edit-status">Status</InputLabel>
                      <Select 
                        id="edit-status" 
                        value={status} 
                        onChange={(e) => setStatus(e.target.value as any)}
                      >
                        <option value="Unwatched">Não Assistido</option>
                        <option value="Watching">Assistindo</option>
                        <option value="Watched">Assistido</option>
                      </Select>
                    </InputWrapper>

                    <InputWrapper>
                      <InputLabel>Sua Nota</InputLabel>
                      <StarRatingSelector>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarButton
                            key={star}
                            type="button"
                            $selected={star <= rating}
                            onClick={() => setRating(star)}
                          >
                            ★
                          </StarButton>
                        ))}
                      </StarRatingSelector>
                    </InputWrapper>
                  </FormRow>

                  <FormRow>
                    <InputWrapper>
                      <InputLabel htmlFor="edit-platform">Onde assistir / Plataforma</InputLabel>
                      <Select 
                        id="edit-platform" 
                        value={platform} 
                        onChange={(e) => setPlatform(e.target.value)}
                      >
                        <option value="Netflix">Netflix</option>
                        <option value="AppleTv">Apple TV+</option>
                        <option value="Prime Video">Prime Video</option>
                        <option value="Disney+">Disney+</option>
                        <option value="HBO Max">HBO Max</option>
                        <option value="Paramount+">Paramount+</option>
                        <option value="Other">Outro (Digitar)</option>
                      </Select>
                    </InputWrapper>

                    {platform === 'Other' && (
                      <InputWrapper>
                        <InputLabel htmlFor="edit-custom-platform">Especificar Plataforma</InputLabel>
                        <SmallInput 
                          type="text" 
                          id="edit-custom-platform" 
                          value={customPlatform}
                          onChange={(e) => setCustomPlatform(e.target.value)}
                        />
                      </InputWrapper>
                    )}
                  </FormRow>

                  <FormRow>
                    <InputWrapper>
                      <InputLabel htmlFor="edit-times-watched">Quantidade de vezes assistida</InputLabel>
                      <SmallInput 
                        type="number" 
                        id="edit-times-watched" 
                        min="1"
                        value={timesWatched}
                        onChange={(e) => setTimesWatched(parseInt(e.target.value, 10) || 1)}
                      />
                    </InputWrapper>
                  </FormRow>

                  {/* Series specifics */}
                  {editingShow.type === 'series' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '20px' }}>
                      <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--accent)' }}>Progresso da Série</h4>
                      <FormRow>
                        <InputWrapper>
                          <InputLabel htmlFor="edit-seasons">Total de Temporadas</InputLabel>
                          <SmallInput 
                            type="number" 
                            id="edit-seasons" 
                            min="1"
                            value={seasonsCount}
                            onChange={(e) => setSeasonsCount(parseInt(e.target.value, 10) || 1)}
                          />
                        </InputWrapper>

                        <InputWrapper>
                          <InputLabel htmlFor="edit-episodes">Total de Episódios</InputLabel>
                          <SmallInput 
                            type="number" 
                            id="edit-episodes" 
                            min="1"
                            value={episodesCount}
                            onChange={(e) => setEpisodesCount(parseInt(e.target.value, 10) || 1)}
                          />
                        </InputWrapper>
                      </FormRow>

                      {status !== 'Unwatched' && (
                        <FormRow>
                          <InputWrapper>
                            <InputLabel htmlFor="edit-cur-season">Temporada Atual</InputLabel>
                            <SmallInput 
                              type="number" 
                              id="edit-cur-season" 
                              min="1"
                              max={seasonsCount}
                              value={currentSeason}
                              onChange={(e) => setCurrentSeason(parseInt(e.target.value, 10) || 1)}
                            />
                          </InputWrapper>

                          <InputWrapper>
                            <InputLabel htmlFor="edit-cur-episode">Episódio Atual</InputLabel>
                            <SmallInput 
                              type="number" 
                              id="edit-cur-episode" 
                              min="1"
                              value={currentEpisode}
                              onChange={(e) => setCurrentEpisode(parseInt(e.target.value, 10) || 1)}
                            />
                          </InputWrapper>
                        </FormRow>
                      )}
                    </div>
                  )}

                  <ModalActions style={{ justifyContent: 'space-between' }}>
                    <ActionButton $variant="danger" onClick={handleDeleteShow}>
                      Remover da Lista
                    </ActionButton>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <ActionButton $variant="secondary" onClick={() => setEditingShow(null)}>
                        Cancelar
                      </ActionButton>
                      <ActionButton $variant="primary" onClick={handleUpdateShow}>
                        Salvar Alterações
                      </ActionButton>
                    </div>
                  </ModalActions>
                </FormSection>
              </ModalDetails>
            </ModalGrid>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}
