'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '@/context/AuthContext';
import { 
  addShow, 
  updateShow, 
  deleteShow, 
  subscribeToShows, 
  TrackedShow,
  addBook,
  updateBook,
  deleteBook,
  subscribeToBooks,
  TrackedBook,
  addCourse,
  updateCourse,
  deleteCourse,
  subscribeToCourses,
  TrackedCourse
} from '@/lib/firestore';
import { OMBDetailResponse, OMDBMovie, OMBSearchResponse } from './api/search/route';

const STREAMING_PLATFORMS = [
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

  @media (max-width: 768px) {
    display: none;
  }
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: #ffffff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 4px;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileDropdownMenu = styled.div`
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  background: #0d0d13;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-top: none;
  border-radius: 0 0 12px 12px;
  padding: 16px 24px;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
  z-index: 20;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  min-width: 200px;
  
  @media (max-width: 768px) {
    display: flex;
  }
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

// Categories Tabs Style
const CategoryTabsContainer = styled.div`
  display: flex;
  justify-content: center;
  background: rgba(255, 255, 255, 0.02);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
`;

const CategoryTabButton = styled.button<{ $active: boolean; $category: 'shows' | 'books' | 'courses' }>`
  flex: 1;
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.06)' : 'transparent'};
  border: none;
  border-radius: 8px;
  color: ${props => props.$active ? '#ffffff' : 'var(--foreground-muted)'};
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  border-bottom: 2px solid ${props => 
    props.$active 
      ? (props.$category === 'shows' ? '#8b5cf6' : props.$category === 'books' ? '#10b981' : '#06b6d4')
      : 'transparent'
  };

  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.03);
  }
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
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
`;

const TabList = styled.div`
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.03);
  padding: 4px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow-x: auto;
  white-space: nowrap;
  max-width: 100%;
  
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
  
  @media (max-width: 768px) {
    width: 100%;
  }
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
  flex-shrink: 0;

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
  
  @media (max-width: 768px) {
    max-width: 320px;
  }

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

const OrderBadge = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  background: var(--primary);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  z-index: 2;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
`;

// Book Card Styles
const BookCard = styled.div`
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
    border-color: rgba(16, 185, 129, 0.4);
    box-shadow: 0 12px 30px rgba(16, 185, 129, 0.15);
  }
`;

const BookCoverPlaceholder = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #0f5132 0%, #051b11 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 10px;
    height: 100%;
    background: rgba(255, 255, 255, 0.06);
    box-shadow: 1px 0 3px rgba(0, 0, 0, 0.2);
  }
`;

const BookCoverTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.3;
  margin-top: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const BookCoverAuthor = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
`;

// Course Card Styles
const CourseCard = styled.div`
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
    border-color: rgba(6, 182, 212, 0.4);
    box-shadow: 0 12px 30px rgba(6, 182, 212, 0.15);
  }
`;

const CourseHeaderPlaceholder = styled.div`
  width: 100%;
  height: 160px;
  background: linear-gradient(135deg, #083344 0%, #02151c 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 16px;
  gap: 8px;
  position: relative;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const CoursePlatformIcon = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #ffffff;
  backdrop-filter: blur(5px);
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 4px;
`;

const ProgressBarFill = styled.div<{ $progress: number; $color?: string }>`
  width: ${props => Math.min(Math.max(props.$progress, 0), 100)}%;
  height: 100%;
  background: ${props => props.$color || 'var(--primary)'};
  transition: width 0.3s ease;
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

  ${props => props.$status === 'Watching' && css`
    animation: ${pulseGlow} 2s infinite ease-in-out;
  `}
`;

const BookStatusBadge = styled.span<{ $status: 'PlanToRead' | 'Reading' | 'Read' }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  background-color: ${props => 
    props.$status === 'Read' ? 'rgba(16, 185, 129, 0.15)' : 
    props.$status === 'Reading' ? 'rgba(6, 182, 212, 0.15)' : 
    'rgba(245, 158, 11, 0.15)'};
    
  color: ${props => 
    props.$status === 'Read' ? '#34d399' : 
    props.$status === 'Reading' ? '#22d3ee' : 
    '#fbbf24'};
    
  border: 1px solid ${props => 
    props.$status === 'Read' ? 'rgba(16, 185, 129, 0.3)' : 
    props.$status === 'Reading' ? 'rgba(6, 182, 212, 0.3)' : 
    'rgba(245, 158, 11, 0.3)'};

  ${props => props.$status === 'Reading' && css`
    animation: ${pulseGlow} 2s infinite ease-in-out;
  `}
`;

const CourseStatusBadge = styled.span<{ $status: 'PlanToStart' | 'Studying' | 'Completed' }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  background-color: ${props => 
    props.$status === 'Completed' ? 'rgba(16, 185, 129, 0.15)' : 
    props.$status === 'Studying' ? 'rgba(6, 182, 212, 0.15)' : 
    'rgba(245, 158, 11, 0.15)'};
    
  color: ${props => 
    props.$status === 'Completed' ? '#34d399' : 
    props.$status === 'Studying' ? '#22d3ee' : 
    '#fbbf24'};
    
  border: 1px solid ${props => 
    props.$status === 'Completed' ? 'rgba(16, 185, 129, 0.3)' : 
    props.$status === 'Studying' ? 'rgba(6, 182, 212, 0.3)' : 
    'rgba(245, 158, 11, 0.3)'};

  ${props => props.$status === 'Studying' && css`
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

const SortSelect = styled(Select)`
  width: auto;
  padding: 8px 12px;
  font-size: 0.9rem;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
    padding: 6px 10px;
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

const ImportTabContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 10px;
`;

const ImportTabButton = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? 'rgba(139, 92, 246, 0.15)' : 'transparent'};
  border: 1px solid ${props => props.$active ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)'};
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const ImportRowList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 45vh;
  overflow-y: auto;
  padding: 8px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.1);
`;

const ImportRowItem = styled.div<{ $selected: boolean; $hasMatch: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: ${props => props.$selected ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.01)'};
  border: 1px solid ${props => !props.$selected ? 'rgba(255, 255, 255, 0.03)' : props.$hasMatch ? 'rgba(139, 92, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
  border-radius: 8px;
  opacity: ${props => props.$selected ? 1 : 0.5};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
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
  justify-content: center;
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
 * Renders simple star count component for show/book/course cards.
 *
 * @param rating - Rating score from 1 to 5
 * @returns Array of JSX elements containing stars
 */
const renderStars = (rating: number) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span 
        key={i} 
        style={{ color: i <= rating ? '#fbbf24' : 'rgba(255, 255, 255, 0.15)' }}
      >
        ★
      </span>
    );
  }
  return stars;
};

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
  // Modals Visibility
  const [editingShow, setEditingShow] = useState<TrackedShow | null>(null);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [editingBook, setEditingBook] = useState<TrackedBook | null>(null);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState<TrackedCourse | null>(null);

  // Local filtering states
  const [activeTab, setActiveTab] = useState<string>('All');
  const [localSearch, setLocalSearch] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'watchOrder' | 'rating' | 'title'>('recent');
  const [typeFilter, setTypeFilter] = useState<'all' | 'movie' | 'series'>('all');

  // Form Fields: Shows
  const [status, setStatus] = useState<'Unwatched' | 'Watching' | 'Watched'>('Unwatched');
  const [rating, setRating] = useState<number>(0);
  const [platform, setPlatform] = useState('Netflix');
  const [customPlatform, setCustomPlatform] = useState('');
  const [timesWatched, setTimesWatched] = useState<number>(1);
  const [watchOrder, setWatchOrder] = useState<number | ''>('');
  const [currentSeason, setCurrentSeason] = useState<number>(1);
  const [currentEpisode, setCurrentEpisode] = useState<number>(1);
  const [seasonsCount, setSeasonsCount] = useState<number>(1);
  const [episodesCount, setEpisodesCount] = useState<number>(1);

  // Show Manual & Edit Form States
  const [showTitle, setShowTitle] = useState('');
  const [showType, setShowType] = useState<'movie' | 'series'>('movie');
  const [showYear, setShowYear] = useState('');
  const [showGenre, setShowGenre] = useState('');
  const [showDirector, setShowDirector] = useState('');
  const [showRuntime, setShowRuntime] = useState('');
  const [showProduction, setShowProduction] = useState('');
  const [showCountry, setShowCountry] = useState('');
  const [showPoster, setShowPoster] = useState('');
  const [showImdbID, setShowImdbID] = useState('');
  const [isAddingShow, setIsAddingShow] = useState(false);

  // Show Import State
  const [isImportingShows, setIsImportingShows] = useState(false);
  const [importStep, setImportStep] = useState<number>(1);
  const [importRawList, setImportRawList] = useState('');
  const [importItems, setImportItems] = useState<any[]>([]);
  const [importGlobalStatus, setImportGlobalStatus] = useState<'Unwatched' | 'Watching' | 'Watched'>('Watched');
  const [importGlobalPlatform, setImportGlobalPlatform] = useState('Netflix');
  const [importGlobalRating, setImportGlobalRating] = useState<number>(0);
  const [importGlobalTimesWatched, setImportGlobalTimesWatched] = useState<number>(1);
  const [importActiveTab, setImportActiveTab] = useState<'text' | 'csv'>('text');
  
  // Progress states
  const [importProgressCurrent, setImportProgressCurrent] = useState(0);
  const [importProgressTotal, setImportProgressTotal] = useState(0);
  const [importIsSaving, setImportIsSaving] = useState(false);

  // Form Fields: Books
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookGenre, setBookGenre] = useState('');
  const [bookTotalPages, setBookTotalPages] = useState<number>(100);
  const [bookFormat, setBookFormat] = useState('Physical');
  const [bookCustomFormat, setBookCustomFormat] = useState('');
  const [bookStatus, setBookStatus] = useState<'PlanToRead' | 'Reading' | 'Read'>('PlanToRead');
  const [bookCurrentPage, setBookCurrentPage] = useState<number>(0);
  const [bookRating, setBookRating] = useState<number>(0);
  const [bookTimesRead, setBookTimesRead] = useState<number>(1);

  // Form Fields: Courses
  const [courseTitle, setCourseTitle] = useState('');
  const [coursePlatform, setCoursePlatform] = useState('Udemy');
  const [courseCustomPlatform, setCourseCustomPlatform] = useState('');
  const [courseStatus, setCourseStatus] = useState<'PlanToStart' | 'Studying' | 'Completed'>('PlanToStart');
  const [courseRating, setCourseRating] = useState<number>(0);
  const [courseTimesCompleted, setCourseTimesCompleted] = useState<number>(1);
  const [courseProgressType, setCourseProgressType] = useState<'minutes' | 'hours'>('minutes');
  const [courseTotalMinutes, setCourseTotalMinutes] = useState<number>(120);
  const [courseCurrentMinutes, setCourseCurrentMinutes] = useState<number>(0);
  const [courseTotalHours, setCourseTotalHours] = useState<number>(10);
  const [courseCurrentHours, setCourseCurrentHours] = useState<number>(0);

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
          // Set editable metadata states
          setShowTitle(data.Title);
          setShowType(data.Type === 'series' ? 'series' : 'movie');
          setShowYear(data.Year);
          setShowGenre(data.Genre);
          setShowDirector(data.Director);
          setShowRuntime(data.Runtime);
          setShowProduction(data.Production || 'N/A');
          setShowCountry(data.Country);
          setShowPoster(data.Poster !== 'N/A' ? data.Poster : '/file.svg');
          setShowImdbID(data.imdbID);

          // Set default form values
          setStatus('Unwatched');
          setRating(0);
          setPlatform('Netflix');
          setCustomPlatform('');
          setTimesWatched(0);
          setWatchOrder('');
          setCurrentSeason(1);
          setCurrentEpisode(1);
          setSeasonsCount(data.totalSeasons ? parseInt(data.totalSeasons, 10) || 1 : 1);
          setEpisodesCount(12);
          
          setIsAddingShow(true);
        }
      }
    } catch (err) {
      console.error('Error fetching show details:', err);
    }
  };

  /* =========================================================================
     SHOW HANDLERS
     ========================================================================= */
  const handleSaveShow = async () => {
    if (!user) return;

    const actualPlatform = platform === 'Other' ? customPlatform : platform;

    const newShow: Omit<TrackedShow, 'id' | 'userId' | 'createdAt'> = {
      imdbID: showImdbID || 'manual',
      title: showTitle,
      type: showType,
      year: showYear,
      poster: showPoster || '/file.svg',
      genre: showGenre || 'N/A',
      director: showDirector || 'N/A',
      runtime: showRuntime || 'N/A',
      production: showProduction || 'N/A',
      country: showCountry || 'N/A',
      status,
      rating,
      platform: actualPlatform || 'N/A',
      timesWatched,
      watchOrder: watchOrder !== '' ? watchOrder : null,
      ...(showType === 'series' ? {
        seasonsCount,
        episodesCount,
        currentSeason,
        currentEpisode
      } : {})
    };

    try {
      await addShow(user.uid, newShow);
      setIsAddingShow(false);

      // Reset states
      setShowTitle('');
      setShowType('movie');
      setShowYear('');
      setShowGenre('');
      setShowDirector('');
      setShowRuntime('');
      setShowProduction('');
      setShowCountry('');
      setShowPoster('');
      setShowImdbID('');

      setStatus('Unwatched');
      setRating(0);
      setPlatform('Netflix');
      setCustomPlatform('');
      setTimesWatched(1);
      setWatchOrder('');
      setCurrentSeason(1);
      setCurrentEpisode(1);
    } catch (err) {
      console.error('Failed to save show:', err);
    }
  };

  const handleStartEditShow = (show: TrackedShow) => {
    setEditingShow(show);
    
    // Set editable metadata states
    setShowTitle(show.title);
    setShowType(show.type);
    setShowYear(show.year);
    setShowGenre(show.genre || '');
    setShowDirector(show.director || '');
    setShowRuntime(show.runtime || '');
    setShowProduction(show.production || '');
    setShowCountry(show.country || '');
    setShowPoster(show.poster || '');
    setShowImdbID(show.imdbID || '');

    setStatus(show.status);
    setRating(show.rating);
    
    if (STREAMING_PLATFORMS.includes(show.platform)) {
      setPlatform(show.platform);
      setCustomPlatform('');
    } else {
      setPlatform('Other');
      setCustomPlatform(show.platform);
    }

    setTimesWatched(show.timesWatched);
    setWatchOrder(show.watchOrder !== undefined && show.watchOrder !== null ? show.watchOrder : '');
    if (show.type === 'series') {
      setCurrentSeason(show.currentSeason || 1);
      setCurrentEpisode(show.currentEpisode || 1);
      setSeasonsCount(show.seasonsCount || 1);
      setEpisodesCount(show.episodesCount || 1);
    }
  };

  const handleUpdateShow = async () => {
    if (!editingShow) return;

    const actualPlatform = platform === 'Other' ? customPlatform : platform;

    const updatedFields: Partial<Omit<TrackedShow, 'id' | 'userId' | 'createdAt'>> = {
      title: showTitle,
      type: showType,
      year: showYear,
      genre: showGenre,
      director: showDirector,
      runtime: showRuntime,
      production: showProduction,
      country: showCountry,
      poster: showPoster,
      imdbID: showImdbID,
      status,
      rating,
      platform: actualPlatform || 'N/A',
      timesWatched,
      watchOrder: watchOrder !== '' ? watchOrder : null,
      ...(showType === 'series' ? {
        currentSeason,
        currentEpisode,
        seasonsCount,
        episodesCount
      } : {})
    };

    try {
      await updateShow(editingShow.id, updatedFields);
      setEditingShow(null);

      // Reset states
      setShowTitle('');
      setShowType('movie');
      setShowYear('');
      setShowGenre('');
      setShowDirector('');
      setShowRuntime('');
      setShowProduction('');
      setShowCountry('');
      setShowPoster('');
      setShowImdbID('');
      setWatchOrder('');
    } catch (err) {
      console.error('Failed to update show:', err);
    }
  };

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

  /* =========================================================================
     SHOW IMPORT HANDLERS
     ========================================================================= */
  // Helper to parse CSV string to rows of data
  const parseCSV = (csvText: string) => {
    const lines: string[] = [];
    let currentLine = '';
    let inQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === '\n' && !inQuotes) {
        lines.push(currentLine.trim());
        currentLine = '';
      } else if (char === '\r') {
        // Skip carriage return
      } else {
        currentLine += char;
      }
    }
    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }

    if (lines.length === 0) return [];

    const splitRow = (rowText: string) => {
      const cols: string[] = [];
      let currentCol = '';
      let rowInQuotes = false;
      
      const separator = rowText.includes(';') ? ';' : ',';

      for (let i = 0; i < rowText.length; i++) {
        const char = rowText[i];
        if (char === '"') {
          rowInQuotes = !rowInQuotes;
        } else if (char === separator && !rowInQuotes) {
          cols.push(currentCol.trim().replace(/^"|"$/g, ''));
          currentCol = '';
        } else {
          currentCol += char;
        }
      }
      cols.push(currentCol.trim().replace(/^"|"$/g, ''));
      return cols;
    };

    const headers = splitRow(lines[0]).map(h => h.toLowerCase().trim());
    const dataRows: any[] = [];

    const titleIdx = headers.findIndex(h => h.includes('titulo') || h.includes('title') || h.includes('nome') || h.includes('name') || h.includes('filme') || h.includes('show'));
    const statusIdx = headers.findIndex(h => h.includes('status') || h.includes('estado') || h.includes('situacao'));
    const platformIdx = headers.findIndex(h => h.includes('plataforma') || h.includes('platform') || h.includes('onde'));
    const ratingIdx = headers.findIndex(h => h.includes('nota') || h.includes('rating') || h.includes('estrelas') || h.includes('avaliacao'));
    const orderIdx = headers.findIndex(h => h.includes('ordem') || h.includes('order') || h.includes('posicao') || h.includes('cronologia'));
    const timesIdx = headers.findIndex(h => h.includes('vezes') || h.includes('times') || h.includes('assistido') || h.includes('watched'));

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i]) continue;
      const cols = splitRow(lines[i]);
      if (cols.length === 0 || !cols[0]) continue;

      let title = '';
      if (titleIdx !== -1 && cols[titleIdx]) {
        title = cols[titleIdx];
      } else {
        title = cols[0];
      }

      if (!title.trim()) continue;

      let rowStatus: 'Unwatched' | 'Watching' | 'Watched' = importGlobalStatus;
      if (statusIdx !== -1 && cols[statusIdx]) {
        const rawStatus = cols[statusIdx].toLowerCase();
        if (rawStatus.includes('assistindo') || rawStatus.includes('watching') || rawStatus.includes('vendo')) {
          rowStatus = 'Watching';
        } else if (rawStatus.includes('nao') || rawStatus.includes('unwatched') || rawStatus.includes('quero')) {
          rowStatus = 'Unwatched';
        } else if (rawStatus.includes('assistido') || rawStatus.includes('watched') || rawStatus.includes('visto') || rawStatus.includes('sim')) {
          rowStatus = 'Watched';
        }
      }

      let rowPlatform = importGlobalPlatform;
      if (platformIdx !== -1 && cols[platformIdx]) {
        rowPlatform = cols[platformIdx];
      }

      let rowRating = importGlobalRating;
      if (ratingIdx !== -1 && cols[ratingIdx]) {
        const parsedRating = parseInt(cols[ratingIdx], 10);
        if (!isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5) {
          rowRating = parsedRating;
        }
      }

      let rowOrder: number | '' = '';
      if (orderIdx !== -1 && cols[orderIdx]) {
        const parsedOrder = parseInt(cols[orderIdx], 10);
        if (!isNaN(parsedOrder) && parsedOrder > 0) {
          rowOrder = parsedOrder;
        }
      }

      let rowTimes = rowStatus === 'Unwatched' ? 0 : importGlobalTimesWatched;
      if (timesIdx !== -1 && cols[timesIdx]) {
        const parsedTimes = parseInt(cols[timesIdx], 10);
        if (!isNaN(parsedTimes) && parsedTimes >= 0) {
          rowTimes = parsedTimes;
        }
      }

      dataRows.push({
        id: i,
        rawTitle: title,
        searchQuery: title,
        match: null,
        isSearching: false,
        status: rowStatus,
        platform: rowPlatform,
        rating: rowRating,
        timesWatched: rowTimes,
        watchOrder: rowOrder,
        selected: true
      });
    }

    return dataRows;
  };

  const handleProcessRawTextList = () => {
    const titles = importRawList
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const items = titles.map((title, index) => ({
      id: index,
      rawTitle: title,
      searchQuery: title,
      match: null,
      isSearching: false,
      status: importGlobalStatus,
      platform: importGlobalPlatform,
      rating: importGlobalRating,
      timesWatched: importGlobalStatus === 'Unwatched' ? 0 : importGlobalTimesWatched,
      watchOrder: '' as number | '',
      selected: true
    }));

    setImportItems(items);
    setImportStep(2);
    resolveAllMatches(items);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target?.result as string;
      if (csvText) {
        const parsedItems = parseCSV(csvText);
        setImportItems(parsedItems);
        setImportStep(2);
        resolveAllMatches(parsedItems);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const resolveAllMatches = async (itemsList: any[]) => {
    const updatedItems = [...itemsList];
    
    setImportItems(updatedItems.map(item => ({ ...item, isSearching: true })));

    for (let i = 0; i < updatedItems.length; i++) {
      const item = updatedItems[i];
      try {
        const res = await fetch(`/api/search?s=${encodeURIComponent(item.searchQuery)}`);
        const data = await res.json();
        if (data.Response === 'True' && data.Search && data.Search.length > 0) {
          updatedItems[i] = {
            ...item,
            match: data.Search[0],
            isSearching: false
          };
        } else {
          updatedItems[i] = {
            ...item,
            match: null,
            isSearching: false
          };
        }
      } catch (err) {
        console.error('Match resolving failed for', item.searchQuery, err);
        updatedItems[i] = {
          ...item,
          match: null,
          isSearching: false
        };
      }
      setImportItems([...updatedItems]);
    }
  };

  const handleRowSearch = async (itemId: number, query: string) => {
    setImportItems(prev => prev.map(item => item.id === itemId ? { ...item, isSearching: true, searchQuery: query } : item));
    try {
      const res = await fetch(`/api/search?s=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.Response === 'True' && data.Search && data.Search.length > 0) {
        setImportItems(prev => prev.map(item => item.id === itemId ? { 
          ...item, 
          match: data.Search[0], 
          isSearching: false 
        } : item));
      } else {
        setImportItems(prev => prev.map(item => item.id === itemId ? { 
          ...item, 
          match: null, 
          isSearching: false 
        } : item));
      }
    } catch (e) {
      console.error('Row search failed:', e);
      setImportItems(prev => prev.map(item => item.id === itemId ? { 
        ...item, 
        match: null, 
        isSearching: false 
      } : item));
    }
  };

  const handleBulkApply = (field: 'status' | 'platform' | 'rating', value: any) => {
    setImportItems(prev => prev.map(item => {
      if (!item.selected) return item;
      const updated = { ...item, [field]: value };
      if (field === 'status') {
        updated.timesWatched = value === 'Unwatched' ? 0 : 1;
      }
      return updated;
    }));
  };

  const handleConfirmImport = async () => {
    if (!user) return;
    const selectedItems = importItems.filter(item => item.selected && item.match);
    if (selectedItems.length === 0) {
      alert('Nenhum filme com correspondência encontrada foi selecionado para importação.');
      return;
    }

    setImportIsSaving(true);
    setImportStep(3);
    setImportProgressTotal(selectedItems.length);
    setImportProgressCurrent(0);

    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i];
      try {
        const response = await fetch(`/api/search?i=${item.match.imdbID}`);
        if (response.ok) {
          const detail: OMBDetailResponse = await response.json();
          if (detail.Response === 'True') {
            const actualPlatform = item.platform === 'Other' ? '' : item.platform;
            
            const newShow: Omit<TrackedShow, 'id' | 'userId' | 'createdAt'> = {
              imdbID: detail.imdbID,
              title: detail.Title,
              type: detail.Type as 'movie' | 'series',
              year: detail.Year,
              poster: detail.Poster !== 'N/A' ? detail.Poster : '/file.svg',
              genre: detail.Genre,
              director: detail.Director,
              runtime: detail.Runtime,
              production: detail.Production || 'N/A',
              country: detail.Country,
              status: item.status,
              rating: item.rating,
              platform: actualPlatform || 'N/A',
              timesWatched: item.timesWatched,
              watchOrder: item.watchOrder !== '' ? item.watchOrder : null,
              ...(detail.Type === 'series' ? {
                seasonsCount: detail.totalSeasons ? parseInt(detail.totalSeasons, 10) || 1 : 1,
                episodesCount: 12,
                currentSeason: 1,
                currentEpisode: 1
              } : {})
            };

            await addShow(user.uid, newShow);
          }
        }
      } catch (err) {
        console.error('Import failed for show', item.rawTitle, err);
      }
      setImportProgressCurrent(i + 1);
    }

    setImportIsSaving(false);
  };

  /* =========================================================================
     BOOK HANDLERS
     ========================================================================= */
  const handleSaveBook = async () => {
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
      setIsAddingBook(false);
      // Reset form
      setBookTitle('');
      setBookAuthor('');
      setBookGenre('');
      setBookTotalPages(100);
      setBookFormat('Physical');
      setBookCustomFormat('');
      setBookStatus('PlanToRead');
      setBookCurrentPage(0);
      setBookRating(0);
      setBookTimesRead(1);
    } catch (err) {
      console.error('Failed to save book:', err);
    }
  };

  const handleStartEditBook = (book: TrackedBook) => {
    setEditingBook(book);
    setBookTitle(book.title);
    setBookAuthor(book.author);
    setBookGenre(book.genre);
    setBookTotalPages(book.totalPages);
    
    const standardFormats = ['Physical', 'Kindle', 'PDF', 'Audiobook'];
    if (standardFormats.includes(book.format)) {
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
  };

  const handleUpdateBook = async () => {
    if (!editingBook) return;

    const actualFormat = bookFormat === 'Other' ? bookCustomFormat : bookFormat;

    const updatedFields: Partial<Omit<TrackedBook, 'id' | 'userId' | 'createdAt'>> = {
      title: bookTitle,
      author: bookAuthor,
      genre: bookGenre,
      totalPages: bookTotalPages,
      format: actualFormat || 'Physical',
      status: bookStatus,
      currentPage: bookStatus === 'Read' ? bookTotalPages : bookCurrentPage,
      rating: bookRating,
      timesRead: bookTimesRead
    };

    try {
      await updateBook(editingBook.id, updatedFields);
      setEditingBook(null);
    } catch (err) {
      console.error('Failed to update book:', err);
    }
  };

  const handleDeleteBook = async () => {
    if (!editingBook) return;
    if (confirm(`Tem certeza que deseja remover "${editingBook.title}" de sua lista?`)) {
      try {
        await deleteBook(editingBook.id);
        setEditingBook(null);
      } catch (err) {
        console.error('Failed to delete book:', err);
      }
    }
  };

  /* =========================================================================
     COURSE HANDLERS
     ========================================================================= */
  const handleSaveCourse = async () => {
    if (!user || !courseTitle.trim()) return;

    const actualPlatform = coursePlatform === 'Other' ? courseCustomPlatform : coursePlatform;

    const newCourse: Omit<TrackedCourse, 'id' | 'userId' | 'createdAt'> = {
      title: courseTitle,
      platform: actualPlatform || 'N/A',
      status: courseStatus,
      rating: courseRating,
      timesCompleted: courseTimesCompleted,
      progressType: courseProgressType,
      ...(courseProgressType === 'minutes' ? {
        totalMinutes: courseTotalMinutes || 1,
        currentMinutes: courseStatus === 'Completed' ? courseTotalMinutes : courseCurrentMinutes
      } : {
        totalHours: courseTotalHours || 1,
        currentHours: courseStatus === 'Completed' ? courseTotalHours : courseCurrentHours
      })
    };

    try {
      await addCourse(user.uid, newCourse);
      setIsAddingCourse(false);
      // Reset form
      setCourseTitle('');
      setCoursePlatform('Udemy');
      setCourseCustomPlatform('');
      setCourseStatus('PlanToStart');
      setCourseRating(0);
      setCourseTimesCompleted(1);
      setCourseProgressType('minutes');
      setCourseTotalMinutes(120);
      setCourseCurrentMinutes(0);
      setCourseTotalHours(10);
      setCourseCurrentHours(0);
    } catch (err) {
      console.error('Failed to save course:', err);
    }
  };

  const handleStartEditCourse = (course: TrackedCourse) => {
    setEditingCourse(course);
    setCourseTitle(course.title);
    
    const standardPlatforms = [
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
    if (standardPlatforms.includes(course.platform)) {
      setCoursePlatform(course.platform);
      setCourseCustomPlatform('');
    } else {
      setCoursePlatform('Other');
      setCourseCustomPlatform(course.platform);
    }
    
    setCourseStatus(course.status);
    setCourseRating(course.rating);
    setCourseTimesCompleted(course.timesCompleted);
    setCourseProgressType(course.progressType);
    
    if (course.progressType === 'minutes') {
      setCourseTotalMinutes(course.totalMinutes || 120);
      setCourseCurrentMinutes(course.currentMinutes || 0);
      setCourseTotalHours(10);
      setCourseCurrentHours(0);
    } else {
      setCourseTotalHours(course.totalHours || 10);
      setCourseCurrentHours(course.currentHours || 0);
      setCourseTotalMinutes(120);
      setCourseCurrentMinutes(0);
    }
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse) return;

    const actualPlatform = coursePlatform === 'Other' ? courseCustomPlatform : coursePlatform;

    const updatedFields: Partial<Omit<TrackedCourse, 'id' | 'userId' | 'createdAt'>> = {
      title: courseTitle,
      platform: actualPlatform || 'N/A',
      status: courseStatus,
      rating: courseRating,
      timesCompleted: courseTimesCompleted,
      progressType: courseProgressType,
      ...(courseProgressType === 'minutes' ? {
        totalMinutes: courseTotalMinutes,
        currentMinutes: courseStatus === 'Completed' ? courseTotalMinutes : courseCurrentMinutes
      } : {
        totalHours: courseTotalHours,
        currentHours: courseStatus === 'Completed' ? courseTotalHours : courseCurrentHours
      })
    };

    try {
      await updateCourse(editingCourse.id, updatedFields);
      setEditingCourse(null);
    } catch (err) {
      console.error('Failed to update course:', err);
    }
  };

  const handleDeleteCourse = async () => {
    if (!editingCourse) return;
    if (confirm(`Tem certeza que deseja remover "${editingCourse.title}" de sua lista?`)) {
      try {
        await deleteCourse(editingCourse.id);
        setEditingCourse(null);
      } catch (err) {
        console.error('Failed to delete course:', err);
      }
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

  // Helper local filters application
  // Helper local filters application
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

  const filteredBooks = books.filter(book => {
    const matchesTab = activeTab === 'All' ? true : book.status === activeTab;
    const matchesSearch = book.title.toLowerCase().includes(localSearch.toLowerCase()) || 
                          book.author.toLowerCase().includes(localSearch.toLowerCase()) ||
                          book.genre.toLowerCase().includes(localSearch.toLowerCase());
    return matchesTab && matchesSearch;
  });

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
                setShowTitle('');
                setShowType('movie');
                setShowYear('');
                setShowGenre('');
                setShowDirector('');
                setShowRuntime('');
                setShowProduction('');
                setShowCountry('');
                setShowPoster('');
                setShowImdbID('');
                
                setStatus('Unwatched');
                setRating(0);
                setPlatform('Netflix');
                setCustomPlatform('');
                setTimesWatched(0);
                setWatchOrder('');
                setCurrentSeason(1);
                setCurrentEpisode(1);
                setSeasonsCount(1);
                setEpisodesCount(12);
                
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
                setImportStep(1);
                setImportRawList('');
                setImportItems([]);
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
                  // Reset form values to default and open
                  setBookTitle('');
                  setBookAuthor('');
                  setBookGenre('');
                  setBookTotalPages(100);
                  setBookFormat('Physical');
                  setBookCustomFormat('');
                  setBookStatus('PlanToRead');
                  setBookCurrentPage(0);
                  setBookRating(0);
                  setBookTimesRead(1);
                  setIsAddingBook(true);
                } else {
                  // Reset form values to default and open
                  setCourseTitle('');
                  setCoursePlatform('Udemy');
                  setCourseCustomPlatform('');
                  setCourseStatus('PlanToStart');
                  setCourseRating(0);
                  setCourseTimesCompleted(1);
                  setCourseProgressType('minutes');
                  setCourseTotalMinutes(120);
                  setCourseCurrentMinutes(0);
                  setCourseTotalHours(10);
                  setCourseCurrentHours(0);
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
                  <option value="recent">Recentes</option>
                  <option value="watchOrder">Ordem Cronológica</option>
                  <option value="rating">Nota</option>
                  <option value="title">Título (A-Z)</option>
                </SortSelect>
              </div>
            </div>
          )}

          <LocalSearchInput
            type="text"
            placeholder={activeCategory === 'shows' ? "Filtrar por título, gênero ou serviço..." : activeCategory === 'books' ? "Filtrar por título, autor ou gênero..." : "Filtrar por título ou plataforma..."}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </FilterSection>

        {/* SHOWS GRID */}
        {activeCategory === 'shows' && (
          filteredShows.length > 0 ? (
            <ShowsGrid>
              {filteredShows.map((show) => (
                <ShowCard key={show.id} onClick={() => handleStartEditShow(show)}>
                  {show.watchOrder !== undefined && show.watchOrder !== null && show.watchOrder > 0 && (
                    <OrderBadge>#{show.watchOrder}</OrderBadge>
                  )}
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
              {filteredBooks.map((book) => {
                const progressPercentage = book.totalPages > 0 
                  ? Math.round((book.currentPage / book.totalPages) * 100) 
                  : 0;
                return (
                  <BookCard key={book.id} onClick={() => handleStartEditBook(book)}>
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
                  </BookCard>
                );
              })}
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
              {filteredCourses.map((course) => {
                const isMinutes = course.progressType === 'minutes';
                const current = isMinutes ? (course.currentMinutes || 0) : (course.currentHours || 0);
                const total = isMinutes ? (course.totalMinutes || 1) : (course.totalHours || 1);
                const progressPercentage = total > 0 
                  ? Math.round((current / total) * 100) 
                  : 0;
                
                return (
                  <CourseCard key={course.id} onClick={() => handleStartEditCourse(course)}>
                    <CourseHeaderPlaceholder>
                      <CoursePlatformIcon>{course.platform}</CoursePlatformIcon>
                      <div style={{ 
                        fontSize: '1.15rem', 
                        fontWeight: '800', 
                        color: '#ffffff', 
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        padding: '0 8px'
                      }}>
                        {course.title}
                      </div>
                    </CourseHeaderPlaceholder>
                    <CardBody>
                      <CardMeta>
                        <CourseStatusBadge $status={course.status}>
                          {course.status === 'Completed' ? 'Concluído' : 
                           course.status === 'Studying' ? 'Estudando' : 'Quero Começar'}
                        </CourseStatusBadge>
                        <PlatformBadge style={{ textTransform: 'capitalize' }}>
                          {isMinutes ? 'Minutos' : 'Horas'}
                        </PlatformBadge>
                      </CardMeta>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: 'auto' }}>
                        <CardMeta>
                          <span>Progresso</span>
                          <span style={{ fontWeight: 'bold' }}>{progressPercentage}%</span>
                        </CardMeta>
                        <ProgressBarContainer>
                          <ProgressBarFill $progress={progressPercentage} $color="var(--accent)" />
                        </ProgressBarContainer>
                        <CardMeta style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '4px' }}>
                          <span>
                            {isMinutes 
                              ? `${current}m / ${total}m` 
                              : `${current}h / ${total}h`
                            }
                          </span>
                          {course.timesCompleted > 1 && <span>Concluído {course.timesCompleted}x</span>}
                        </CardMeta>
                      </div>
                      <CardMeta style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px' }}>
                        <RatingStars>{renderStars(course.rating)}</RatingStars>
                      </CardMeta>
                    </CardBody>
                  </CourseCard>
                );
              })}
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
      
      {/* MODAL: Bulk Importer */}
      {isImportingShows && (
        <ModalOverlay onClick={() => { if (!importIsSaving) setIsImportingShows(false); }}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '950px', padding: '30px' }}>
            <CloseButton onClick={() => setIsImportingShows(false)} disabled={importIsSaving}>×</CloseButton>
            
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px', background: 'linear-gradient(135deg, #ffffff 30%, var(--primary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              📥 Importar Lista de Filmes & Séries
            </h2>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Importe múltiplos itens de uma vez buscando correspondências de dados no OMDB automaticamente.
            </p>

            {importStep === 1 && (
              <div>
                <ImportTabContainer>
                  <ImportTabButton 
                    $active={importActiveTab === 'text'} 
                    onClick={() => setImportActiveTab('text')}
                  >
                    📝 Lista de Texto
                  </ImportTabButton>
                  <ImportTabButton 
                    $active={importActiveTab === 'csv'} 
                    onClick={() => setImportActiveTab('csv')}
                  >
                    📊 Arquivo CSV
                  </ImportTabButton>
                </ImportTabContainer>

                {importActiveTab === 'text' ? (
                  <div style={{ marginBottom: '20px' }}>
                    <InputLabel htmlFor="import-raw-text">Cole os títulos abaixo (um por linha)</InputLabel>
                    <textarea
                      id="import-raw-text"
                      rows={8}
                      placeholder="Ex:&#10;Matrix&#10;Interestelar&#10;A Origem"
                      value={importRawList}
                      onChange={(e) => setImportRawList(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        padding: '12px',
                        color: 'white',
                        fontFamily: 'inherit',
                        fontSize: '0.95rem',
                        resize: 'vertical',
                        outline: 'none',
                        marginTop: '8px'
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ marginBottom: '20px' }}>
                    <InputLabel>Selecione o arquivo CSV</InputLabel>
                    <div style={{
                      border: '2px dashed rgba(255,255,255,0.15)',
                      borderRadius: '12px',
                      padding: '40px 20px',
                      textAlign: 'center',
                      background: 'rgba(255,255,255,0.01)',
                      position: 'relative',
                      marginTop: '8px',
                      cursor: 'pointer'
                    }}>
                      <span style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}>📁</span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--foreground-muted)' }}>
                        Clique para selecionar ou arraste o arquivo .csv aqui
                      </span>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleCSVUpload}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          opacity: 0,
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '8px' }}>
                      * O CSV pode conter colunas como: <i>titulo, ordem, status, plataforma, nota</i>. O delimitador pode ser vírgula (,) ou ponto e vírgula (;).
                    </p>
                  </div>
                )}

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '16px', textTransform: 'uppercase', fontWeight: 700 }}>Valores Padrão para Itens Sem Definição</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                    <InputWrapper>
                      <InputLabel htmlFor="import-status">Status</InputLabel>
                      <Select 
                        id="import-status" 
                        value={importGlobalStatus}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setImportGlobalStatus(val);
                          setImportGlobalTimesWatched(val === 'Unwatched' ? 0 : 1);
                        }}
                      >
                        <option value="Unwatched">Não Assistido</option>
                        <option value="Watching">Assistindo</option>
                        <option value="Watched">Assistido</option>
                      </Select>
                    </InputWrapper>

                    <InputWrapper>
                      <InputLabel htmlFor="import-platform">Plataforma</InputLabel>
                      <Select 
                        id="import-platform" 
                        value={importGlobalPlatform}
                        onChange={(e) => setImportGlobalPlatform(e.target.value)}
                      >
                        {STREAMING_PLATFORMS.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                        <option value="Other">Outra</option>
                      </Select>
                    </InputWrapper>

                    <InputWrapper>
                      <InputLabel htmlFor="import-times">Vezes Assistida</InputLabel>
                      <SmallInput 
                        type="number" 
                        id="import-times"
                        min="0"
                        value={importGlobalTimesWatched}
                        onChange={(e) => setImportGlobalTimesWatched(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      />
                    </InputWrapper>

                    <InputWrapper>
                      <InputLabel>Nota</InputLabel>
                      <StarRatingSelector style={{ marginTop: '8px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarButton
                            key={star}
                            type="button"
                            $selected={star <= importGlobalRating}
                            onClick={() => setImportGlobalRating(star)}
                          >
                            ★
                          </StarButton>
                        ))}
                      </StarRatingSelector>
                    </InputWrapper>
                  </div>
                </div>

                <ModalActions>
                  <ActionButton $variant="secondary" onClick={() => setIsImportingShows(false)}>Cancelar</ActionButton>
                  {importActiveTab === 'text' && (
                    <ActionButton $variant="primary" onClick={handleProcessRawTextList} disabled={!importRawList.trim()}>
                      Processar Lista
                    </ActionButton>
                  )}
                </ModalActions>
              </div>
            )}

            {importStep === 2 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--foreground-muted)' }}>
                    {importItems.filter(i => i.selected).length} de {importItems.length} selecionados para importação.
                  </span>
                  
                  {/* Bulk actions */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>Alterar marcados:</span>
                    <select 
                      onChange={(e) => handleBulkApply('status', e.target.value)} 
                      defaultValue=""
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem' }}
                    >
                      <option value="" disabled>Status...</option>
                      <option value="Unwatched">Não Assistido</option>
                      <option value="Watching">Assistindo</option>
                      <option value="Watched">Assistido</option>
                    </select>

                    <select 
                      onChange={(e) => handleBulkApply('platform', e.target.value)} 
                      defaultValue=""
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem' }}
                    >
                      <option value="" disabled>Plataforma...</option>
                      {STREAMING_PLATFORMS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                      <option value="Other">Outra</option>
                    </select>

                    <select 
                      onChange={(e) => handleBulkApply('rating', parseInt(e.target.value, 10))} 
                      defaultValue=""
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem' }}
                    >
                      <option value="" disabled>Nota...</option>
                      <option value="1">1 Estrela</option>
                      <option value="2">2 Estrelas</option>
                      <option value="3">3 Estrelas</option>
                      <option value="4">4 Estrelas</option>
                      <option value="5">5 Estrelas</option>
                    </select>
                  </div>
                </div>

                <ImportRowList>
                  {importItems.map((item) => (
                    <ImportRowItem key={item.id} $selected={item.selected} $hasMatch={!!item.match}>
                      {/* Checkbox */}
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={item.selected}
                          onChange={(e) => setImportItems(prev => prev.map(i => i.id === item.id ? { ...i, selected: e.target.checked } : i))}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                      </div>

                      {/* Search box & editable title */}
                      <div style={{ flex: '1 1 200px', display: 'flex', gap: '8px' }}>
                        <input 
                          type="text" 
                          value={item.searchQuery}
                          onChange={(e) => setImportItems(prev => prev.map(i => i.id === item.id ? { ...i, searchQuery: e.target.value } : i))}
                          placeholder="Título para pesquisar"
                          style={{
                            flex: 1,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            color: 'white',
                            fontSize: '0.85rem'
                          }}
                        />
                        <button
                          onClick={() => handleRowSearch(item.id, item.searchQuery)}
                          disabled={item.isSearching}
                          style={{
                            background: 'var(--primary)',
                            border: 'none',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          {item.isSearching ? '...' : '🔍'}
                        </button>
                      </div>

                      {/* Match results preview */}
                      <div style={{ flex: '1.5 1 250px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.isSearching ? (
                          <span style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)' }}>Buscando...</span>
                        ) : item.match ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img 
                              src={item.match.Poster !== 'N/A' ? item.match.Poster : '/file.svg'} 
                              alt={item.match.Title} 
                              style={{ height: '40px', width: '30px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                                {item.match.Title}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>
                                {item.match.Year} • {item.match.Type === 'series' ? 'Série' : 'Filme'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 600 }}>
                            ⚠️ Não encontrado. Tente buscar em Inglês.
                          </span>
                        )}
                      </div>

                      {/* Custom inputs for this row */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Watch Order */}
                        <div style={{ display: 'flex', flexDirection: 'column', width: '60px' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)' }}>Ordem</span>
                          <input 
                            type="number"
                            min="1"
                            placeholder="#"
                            value={item.watchOrder}
                            onChange={(e) => setImportItems(prev => prev.map(i => i.id === item.id ? { ...i, watchOrder: e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10) || 1) } : i))}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '4px 6px', borderRadius: '6px', fontSize: '0.8rem', width: '100%' }}
                          />
                        </div>

                        {/* Status */}
                        <div style={{ display: 'flex', flexDirection: 'column', width: '90px' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)' }}>Status</span>
                          <select
                            value={item.status}
                            onChange={(e) => {
                              const val = e.target.value as any;
                              setImportItems(prev => prev.map(i => i.id === item.id ? { ...i, status: val, timesWatched: val === 'Unwatched' ? 0 : 1 } : i));
                            }}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '4px 6px', borderRadius: '6px', fontSize: '0.8rem' }}
                          >
                            <option value="Unwatched">Não Visto</option>
                            <option value="Watching">Vendo</option>
                            <option value="Watched">Visto</option>
                          </select>
                        </div>

                        {/* Platform */}
                        <div style={{ display: 'flex', flexDirection: 'column', width: '90px' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)' }}>Plataforma</span>
                          <select
                            value={item.platform}
                            onChange={(e) => setImportItems(prev => prev.map(i => i.id === item.id ? { ...i, platform: e.target.value } : i))}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '4px 6px', borderRadius: '6px', fontSize: '0.8rem' }}
                          >
                            {STREAMING_PLATFORMS.map(p => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                            <option value="Other">Outra</option>
                          </select>
                        </div>

                        {/* Rating */}
                        <div style={{ display: 'flex', flexDirection: 'column', width: '60px' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)' }}>Nota</span>
                          <select
                            value={item.rating}
                            onChange={(e) => setImportItems(prev => prev.map(i => i.id === item.id ? { ...i, rating: parseInt(e.target.value, 10) } : i))}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '4px 6px', borderRadius: '6px', fontSize: '0.8rem' }}
                          >
                            <option value="1">★</option>
                            <option value="2">★★</option>
                            <option value="3">★★★</option>
                            <option value="4">★★★★</option>
                            <option value="5">★★★★★</option>
                          </select>
                        </div>

                        {/* Delete Row */}
                        <button
                          onClick={() => setImportItems(prev => prev.filter(i => i.id !== item.id))}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            marginTop: '12px'
                          }}
                          title="Remover linha"
                        >
                          🗑️
                        </button>
                      </div>
                    </ImportRowItem>
                  ))}
                </ImportRowList>

                <ModalActions>
                  <ActionButton $variant="secondary" onClick={() => setImportStep(1)}>Voltar</ActionButton>
                  <ActionButton 
                    $variant="primary" 
                    onClick={handleConfirmImport} 
                    disabled={importItems.filter(i => i.selected && i.match).length === 0}
                  >
                    Confirmar Importação ({importItems.filter(i => i.selected && i.match).length})
                  </ActionButton>
                </ModalActions>
              </div>
            )}

            {importStep === 3 && (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                {importIsSaving ? (
                  <div>
                    <span style={{ fontSize: '3rem', display: 'block', animation: 'spin 2s linear infinite', marginBottom: '20px' }}>⏳</span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>Importando dados de filmes...</h3>
                    <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                      Importando {importProgressCurrent} de {importProgressTotal} filmes.
                    </p>

                    <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden', maxWidth: '400px', margin: '0 auto' }}>
                      <div style={{ width: `${(importProgressCurrent / importProgressTotal) * 100}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                ) : (
                  <div>
                    <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '20px' }}>✅</span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '10px', color: '#10b981' }}>Importação Concluída com Sucesso!</h3>
                    <p style={{ color: 'var(--foreground-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>
                      {importProgressTotal} filmes/séries foram adicionados à sua biblioteca do Tracker All.
                    </p>
                    <ActionButton $variant="primary" style={{ margin: '0 auto', display: 'block' }} onClick={() => setIsImportingShows(false)}>
                      Fechar
                    </ActionButton>
                  </div>
                )}
              </div>
            )}
          </ModalContent>
        </ModalOverlay>
      )}

      {/* =========================================================================
         MODALS RENDER
         ========================================================================= */}
      
      {/* MODAL: Adding new show details */}
      {/* MODAL: Adding new show details */}
      {isAddingShow && (
        <ModalOverlay onClick={() => setIsAddingShow(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px' }}>
            <CloseButton onClick={() => setIsAddingShow(false)}>✕</CloseButton>
            
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '24px', background: 'linear-gradient(135deg, #ffffff 30%, var(--primary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Adicionar Show (Filme ou Série)
            </h3>

            <ModalGrid>
              <ModalPosterContainer>
                <ModalPoster 
                  src={showPoster || '/file.svg'} 
                  alt={showTitle || 'Poster Preview'} 
                />
                <InputWrapper style={{ marginTop: '16px' }}>
                  <InputLabel htmlFor="add-poster">URL da Imagem de Capa</InputLabel>
                  <SmallInput 
                    type="text" 
                    id="add-poster" 
                    placeholder="https://exemplo.com/poster.jpg"
                    value={showPoster}
                    onChange={(e) => setShowPoster(e.target.value)}
                  />
                </InputWrapper>
              </ModalPosterContainer>
              
              <ModalDetails>
                <FormSection onSubmit={(e) => e.preventDefault()}>
                  <FormRow>
                    <InputWrapper>
                      <InputLabel htmlFor="add-title">Título *</InputLabel>
                      <SmallInput 
                        type="text" 
                        id="add-title" 
                        required
                        placeholder="Ex: Matrix"
                        value={showTitle}
                        onChange={(e) => setShowTitle(e.target.value)}
                      />
                    </InputWrapper>

                    <InputWrapper>
                      <InputLabel htmlFor="add-type">Tipo</InputLabel>
                      <Select 
                        id="add-type"
                        value={showType}
                        onChange={(e) => setShowType(e.target.value as any)}
                      >
                        <option value="movie">Filme</option>
                        <option value="series">Série</option>
                      </Select>
                    </InputWrapper>
                  </FormRow>

                  <MetaGrid style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', padding: '12px', marginBottom: '16px' }}>
                    <InputWrapper>
                      <InputLabel htmlFor="add-year">Ano</InputLabel>
                      <SmallInput 
                        type="text" 
                        id="add-year" 
                        placeholder="Ex: 1999"
                        value={showYear}
                        onChange={(e) => setShowYear(e.target.value)}
                      />
                    </InputWrapper>
                    <InputWrapper>
                      <InputLabel htmlFor="add-director">Diretor</InputLabel>
                      <SmallInput 
                        type="text" 
                        id="add-director" 
                        placeholder="Ex: Lana Wachowski"
                        value={showDirector}
                        onChange={(e) => setShowDirector(e.target.value)}
                      />
                    </InputWrapper>
                    <InputWrapper>
                      <InputLabel htmlFor="add-genre">Gênero</InputLabel>
                      <SmallInput 
                        type="text" 
                        id="add-genre" 
                        placeholder="Ex: Ação, Sci-Fi"
                        value={showGenre}
                        onChange={(e) => setShowGenre(e.target.value)}
                      />
                    </InputWrapper>
                    <InputWrapper>
                      <InputLabel htmlFor="add-runtime">Duração</InputLabel>
                      <SmallInput 
                        type="text" 
                        id="add-runtime" 
                        placeholder="Ex: 136 min"
                        value={showRuntime}
                        onChange={(e) => setShowRuntime(e.target.value)}
                      />
                    </InputWrapper>
                    <InputWrapper>
                      <InputLabel htmlFor="add-country">País</InputLabel>
                      <SmallInput 
                        type="text" 
                        id="add-country" 
                        placeholder="Ex: USA"
                        value={showCountry}
                        onChange={(e) => setShowCountry(e.target.value)}
                      />
                    </InputWrapper>
                    <InputWrapper>
                      <InputLabel htmlFor="add-production">Produtoras</InputLabel>
                      <SmallInput 
                        type="text" 
                        id="add-production" 
                        placeholder="Ex: Warner Bros."
                        value={showProduction}
                        onChange={(e) => setShowProduction(e.target.value)}
                      />
                    </InputWrapper>
                  </MetaGrid>

                  <FormRow>
                    <InputWrapper>
                      <InputLabel htmlFor="add-status">Status</InputLabel>
                      <Select 
                        id="add-status" 
                        value={status} 
                        onChange={(e) => {
                          const newStatus = e.target.value as 'Unwatched' | 'Watching' | 'Watched';
                          setStatus(newStatus);
                          if (newStatus === 'Unwatched') {
                            setTimesWatched(0);
                          } else if (newStatus === 'Watched' && timesWatched === 0) {
                            setTimesWatched(1);
                          }
                        }}
                      >
                        <option value="Unwatched">Não Assistido</option>
                        <option value="Watching">Assistindo</option>
                        <option value="Watched">Assistido</option>
                      </Select>
                    </InputWrapper>

                    <InputWrapper>
                      <InputLabel>Sua Nota</InputLabel>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
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
                        {rating > 0 && (
                          <button 
                            type="button"
                            onClick={() => setRating(0)}
                            style={{ background: 'none', border: 'none', color: 'var(--foreground-muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            Sem nota
                          </button>
                        )}
                      </div>
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
                        {STREAMING_PLATFORMS.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
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
                        min="0"
                        value={timesWatched}
                        onChange={(e) => setTimesWatched(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      />
                    </InputWrapper>

                    <InputWrapper>
                      <InputLabel htmlFor="add-watch-order">Ordem Cronológica / Posição (Opcional)</InputLabel>
                      <SmallInput 
                        type="number" 
                        id="add-watch-order" 
                        min="1"
                        placeholder="Ex: 1, 2, 3..."
                        value={watchOrder}
                        onChange={(e) => setWatchOrder(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10) || 1))}
                      />
                    </InputWrapper>
                  </FormRow>

                  {/* Series specifics */}
                  {showType === 'series' && (
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
                    <ActionButton $variant="secondary" type="button" onClick={() => setIsAddingShow(false)}>
                      Cancelar
                    </ActionButton>
                    <ActionButton $variant="primary" type="button" onClick={handleSaveShow} disabled={!showTitle.trim()}>
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
          <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px' }}>
            <CloseButton onClick={() => setEditingShow(null)}>✕</CloseButton>
            
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '24px', background: 'linear-gradient(135deg, #ffffff 30%, var(--primary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Editar Show (Filme ou Série)
            </h3>

            <ModalGrid>
              <ModalPosterContainer>
                <ModalPoster src={showPoster || '/file.svg'} alt={showTitle} />
                <InputWrapper style={{ marginTop: '16px' }}>
                  <InputLabel htmlFor="edit-poster">URL da Imagem de Capa</InputLabel>
                  <SmallInput 
                    type="text" 
                    id="edit-poster" 
                    placeholder="https://exemplo.com/poster.jpg"
                    value={showPoster}
                    onChange={(e) => setShowPoster(e.target.value)}
                  />
                </InputWrapper>
              </ModalPosterContainer>
              
              <ModalDetails>
                <FormSection onSubmit={(e) => e.preventDefault()}>
                  <FormRow>
                    <InputWrapper>
                      <InputLabel htmlFor="edit-title">Título *</InputLabel>
                      <SmallInput 
                        type="text" 
                        id="edit-title" 
                        required
                        value={showTitle}
                        onChange={(e) => setShowTitle(e.target.value)}
                      />
                    </InputWrapper>

                    <InputWrapper>
                      <InputLabel htmlFor="edit-type">Tipo</InputLabel>
                      <Select 
                        id="edit-type"
                        value={showType}
                        onChange={(e) => setShowType(e.target.value as any)}
                      >
                        <option value="movie">Filme</option>
                        <option value="series">Série</option>
                      </Select>
                    </InputWrapper>
                  </FormRow>

                  <MetaGrid style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', padding: '12px', marginBottom: '16px' }}>
                    <InputWrapper>
                      <InputLabel htmlFor="edit-year">Ano</InputLabel>
                      <SmallInput 
                        type="text" 
                        id="edit-year" 
                        value={showYear}
                        onChange={(e) => setShowYear(e.target.value)}
                      />
                    </InputWrapper>
                    <InputWrapper>
                      <InputLabel htmlFor="edit-director">Diretor</InputLabel>
                      <SmallInput 
                        type="text" 
                        id="edit-director" 
                        value={showDirector}
                        onChange={(e) => setShowDirector(e.target.value)}
                      />
                    </InputWrapper>
                    <InputWrapper>
                      <InputLabel htmlFor="edit-genre">Gênero</InputLabel>
                      <SmallInput 
                        type="text" 
                        id="edit-genre" 
                        value={showGenre}
                        onChange={(e) => setShowGenre(e.target.value)}
                      />
                    </InputWrapper>
                    <InputWrapper>
                      <InputLabel htmlFor="edit-runtime">Duração</InputLabel>
                      <SmallInput 
                        type="text" 
                        id="edit-runtime" 
                        value={showRuntime}
                        onChange={(e) => setShowRuntime(e.target.value)}
                      />
                    </InputWrapper>
                    <InputWrapper>
                      <InputLabel htmlFor="edit-country">País</InputLabel>
                      <SmallInput 
                        type="text" 
                        id="edit-country" 
                        value={showCountry}
                        onChange={(e) => setShowCountry(e.target.value)}
                      />
                    </InputWrapper>
                    <InputWrapper>
                      <InputLabel htmlFor="edit-production">Produtoras</InputLabel>
                      <SmallInput 
                        type="text" 
                        id="edit-production" 
                        value={showProduction}
                        onChange={(e) => setShowProduction(e.target.value)}
                      />
                    </InputWrapper>
                  </MetaGrid>

                  <FormRow>
                    <InputWrapper>
                      <InputLabel htmlFor="edit-status">Status</InputLabel>
                      <Select 
                        id="edit-status" 
                        value={status} 
                        onChange={(e) => {
                          const newStatus = e.target.value as 'Unwatched' | 'Watching' | 'Watched';
                          setStatus(newStatus);
                          if (newStatus === 'Unwatched') {
                            setTimesWatched(0);
                          } else if (newStatus === 'Watched' && timesWatched === 0) {
                            setTimesWatched(1);
                          }
                        }}
                      >
                        <option value="Unwatched">Não Assistido</option>
                        <option value="Watching">Assistindo</option>
                        <option value="Watched">Assistido</option>
                      </Select>
                    </InputWrapper>

                    <InputWrapper>
                      <InputLabel>Sua Nota</InputLabel>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
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
                        {rating > 0 && (
                          <button 
                            type="button"
                            onClick={() => setRating(0)}
                            style={{ background: 'none', border: 'none', color: 'var(--foreground-muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            Sem nota
                          </button>
                        )}
                      </div>
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
                        {STREAMING_PLATFORMS.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
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
                        min="0"
                        value={timesWatched}
                        onChange={(e) => setTimesWatched(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      />
                    </InputWrapper>

                    <InputWrapper>
                      <InputLabel htmlFor="edit-watch-order">Ordem Cronológica / Posição (Opcional)</InputLabel>
                      <SmallInput 
                        type="number" 
                        id="edit-watch-order" 
                        min="1"
                        placeholder="Ex: 1, 2, 3..."
                        value={watchOrder}
                        onChange={(e) => setWatchOrder(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10) || 1))}
                      />
                    </InputWrapper>
                  </FormRow>

                  {/* Series specifics */}
                  {showType === 'series' && (
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
                    <ActionButton $variant="danger" type="button" onClick={handleDeleteShow}>
                      Remover da Lista
                    </ActionButton>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <ActionButton $variant="secondary" type="button" onClick={() => setEditingShow(null)}>
                        Cancelar
                      </ActionButton>
                      <ActionButton $variant="primary" type="button" onClick={handleUpdateShow} disabled={!showTitle.trim()}>
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

      {/* MODAL: Adding new Book */}
      {isAddingBook && (
        <ModalOverlay onClick={() => setIsAddingBook(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <CloseButton onClick={() => setIsAddingBook(false)}>✕</CloseButton>
            <ModalDetails style={{ padding: '30px' }}>
              <ShowHeader>
                <ShowTitle style={{ color: 'var(--success)' }}>Adicionar Novo Livro</ShowTitle>
                <ShowYearMeta>Preencha os detalhes do livro para acompanhar sua leitura</ShowYearMeta>
              </ShowHeader>

              <FormSection style={{ border: 'none', paddingTop: 0 }}>
                <InputWrapper>
                  <InputLabel htmlFor="book-title-in">Título *</InputLabel>
                  <SmallInput 
                    type="text" 
                    id="book-title-in" 
                    placeholder="Digite o título do livro"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                  />
                </InputWrapper>

                <FormRow>
                  <InputWrapper>
                    <InputLabel htmlFor="book-author-in">Autor</InputLabel>
                    <SmallInput 
                      type="text" 
                      id="book-author-in" 
                      placeholder="Nome do autor"
                      value={bookAuthor}
                      onChange={(e) => setBookAuthor(e.target.value)}
                    />
                  </InputWrapper>

                  <InputWrapper>
                    <InputLabel htmlFor="book-genre-in">Gênero</InputLabel>
                    <SmallInput 
                      type="text" 
                      id="book-genre-in" 
                      placeholder="Ex: Ficção, Fantasia, Negócios"
                      value={bookGenre}
                      onChange={(e) => setBookGenre(e.target.value)}
                    />
                  </InputWrapper>
                </FormRow>

                <FormRow>
                  <InputWrapper>
                    <InputLabel htmlFor="book-pages-in">Total de Páginas</InputLabel>
                    <SmallInput 
                      type="number" 
                      id="book-pages-in" 
                      min="1"
                      value={bookTotalPages}
                      onChange={(e) => setBookTotalPages(parseInt(e.target.value, 10) || 100)}
                    />
                  </InputWrapper>

                  <InputWrapper>
                    <InputLabel htmlFor="book-format-in">Formato / Mídia</InputLabel>
                    <Select 
                      id="book-format-in" 
                      value={bookFormat} 
                      onChange={(e) => setBookFormat(e.target.value)}
                    >
                      <option value="Physical">Físico</option>
                      <option value="Kindle">Kindle</option>
                      <option value="PDF">PDF</option>
                      <option value="Audiobook">Audiobook</option>
                      <option value="Other">Outro (Especificar)</option>
                    </Select>
                  </InputWrapper>
                </FormRow>

                {bookFormat === 'Other' && (
                  <InputWrapper>
                    <InputLabel htmlFor="book-custom-format-in">Especificar Formato</InputLabel>
                    <SmallInput 
                      type="text" 
                      id="book-custom-format-in" 
                      placeholder="Ex: Epub, Capa Dura"
                      value={bookCustomFormat}
                      onChange={(e) => setBookCustomFormat(e.target.value)}
                    />
                  </InputWrapper>
                )}

                <FormRow>
                  <InputWrapper>
                    <InputLabel htmlFor="book-status-in">Status de Leitura</InputLabel>
                    <Select 
                      id="book-status-in" 
                      value={bookStatus} 
                      onChange={(e) => {
                        const newStatus = e.target.value as 'PlanToRead' | 'Reading' | 'Read';
                        setBookStatus(newStatus);
                        if (newStatus === 'PlanToRead') {
                          setBookTimesRead(0);
                        } else if (newStatus === 'Read' && bookTimesRead === 0) {
                          setBookTimesRead(1);
                        }
                      }}
                    >
                      <option value="PlanToRead">Quero Ler</option>
                      <option value="Reading">Lendo</option>
                      <option value="Read">Lido</option>
                    </Select>
                  </InputWrapper>

                  {bookStatus === 'Reading' && (
                    <InputWrapper>
                      <InputLabel htmlFor="book-curr-page-in">Página Atual</InputLabel>
                      <SmallInput 
                        type="number" 
                        id="book-curr-page-in" 
                        min="0"
                        max={bookTotalPages}
                        value={bookCurrentPage}
                        onChange={(e) => setBookCurrentPage(Math.min(parseInt(e.target.value, 10) || 0, bookTotalPages))}
                      />
                    </InputWrapper>
                  )}
                </FormRow>

                <FormRow>
                  {bookStatus === 'Read' && (
                    <InputWrapper>
                      <InputLabel htmlFor="book-times-read-in">Vezes Lido</InputLabel>
                      <SmallInput 
                        type="number" 
                        id="book-times-read-in" 
                        min="0"
                        value={bookTimesRead}
                        onChange={(e) => setBookTimesRead(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      />
                    </InputWrapper>
                  )}

                  <InputWrapper>
                    <InputLabel>Sua Nota</InputLabel>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                      {bookRating > 0 && (
                        <button 
                          type="button"
                          onClick={() => setBookRating(0)}
                          style={{ background: 'none', border: 'none', color: 'var(--foreground-muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Sem nota
                        </button>
                      )}
                    </div>
                  </InputWrapper>
                </FormRow>

                <ModalActions>
                  <ActionButton $variant="secondary" onClick={() => setIsAddingBook(false)}>
                    Cancelar
                  </ActionButton>
                  <ActionButton $variant="primary" style={{ background: 'var(--success)' }} onClick={handleSaveBook}>
                    Adicionar Livro
                  </ActionButton>
                </ModalActions>
              </FormSection>
            </ModalDetails>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* MODAL: Editing Book */}
      {editingBook && (
        <ModalOverlay onClick={() => setEditingBook(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <CloseButton onClick={() => setEditingBook(null)}>✕</CloseButton>
            <ModalDetails style={{ padding: '30px' }}>
              <ShowHeader>
                <ShowTitle style={{ color: 'var(--success)' }}>Editar Livro</ShowTitle>
                <ShowYearMeta>Ajuste as informações ou o progresso da sua leitura</ShowYearMeta>
              </ShowHeader>

              <FormSection style={{ border: 'none', paddingTop: 0 }}>
                <InputWrapper>
                  <InputLabel htmlFor="book-title-ed">Título *</InputLabel>
                  <SmallInput 
                    type="text" 
                    id="book-title-ed" 
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                  />
                </InputWrapper>

                <FormRow>
                  <InputWrapper>
                    <InputLabel htmlFor="book-author-ed">Autor</InputLabel>
                    <SmallInput 
                      type="text" 
                      id="book-author-ed" 
                      value={bookAuthor}
                      onChange={(e) => setBookAuthor(e.target.value)}
                    />
                  </InputWrapper>

                  <InputWrapper>
                    <InputLabel htmlFor="book-genre-ed">Gênero</InputLabel>
                    <SmallInput 
                      type="text" 
                      id="book-genre-ed" 
                      value={bookGenre}
                      onChange={(e) => setBookGenre(e.target.value)}
                    />
                  </InputWrapper>
                </FormRow>

                <FormRow>
                  <InputWrapper>
                    <InputLabel htmlFor="book-pages-ed">Total de Páginas</InputLabel>
                    <SmallInput 
                      type="number" 
                      id="book-pages-ed" 
                      min="1"
                      value={bookTotalPages}
                      onChange={(e) => setBookTotalPages(parseInt(e.target.value, 10) || 100)}
                    />
                  </InputWrapper>

                  <InputWrapper>
                    <InputLabel htmlFor="book-format-ed">Formato / Mídia</InputLabel>
                    <Select 
                      id="book-format-ed" 
                      value={bookFormat} 
                      onChange={(e) => setBookFormat(e.target.value)}
                    >
                      <option value="Physical">Físico</option>
                      <option value="Kindle">Kindle</option>
                      <option value="PDF">PDF</option>
                      <option value="Audiobook">Audiobook</option>
                      <option value="Other">Outro (Especificar)</option>
                    </Select>
                  </InputWrapper>
                </FormRow>

                {bookFormat === 'Other' && (
                  <InputWrapper>
                    <InputLabel htmlFor="book-custom-format-ed">Especificar Formato</InputLabel>
                    <SmallInput 
                      type="text" 
                      id="book-custom-format-ed" 
                      value={bookCustomFormat}
                      onChange={(e) => setBookCustomFormat(e.target.value)}
                    />
                  </InputWrapper>
                )}

                <FormRow>
                  <InputWrapper>
                    <InputLabel htmlFor="book-status-ed">Status de Leitura</InputLabel>
                    <Select 
                      id="book-status-ed" 
                      value={bookStatus} 
                      onChange={(e) => {
                        const newStatus = e.target.value as 'PlanToRead' | 'Reading' | 'Read';
                        setBookStatus(newStatus);
                        if (newStatus === 'PlanToRead') {
                          setBookTimesRead(0);
                        } else if (newStatus === 'Read' && bookTimesRead === 0) {
                          setBookTimesRead(1);
                        }
                      }}
                    >
                      <option value="PlanToRead">Quero Ler</option>
                      <option value="Reading">Lendo</option>
                      <option value="Read">Lido</option>
                    </Select>
                  </InputWrapper>

                  {bookStatus === 'Reading' && (
                    <InputWrapper>
                      <InputLabel htmlFor="book-curr-page-ed">Página Atual</InputLabel>
                      <SmallInput 
                        type="number" 
                        id="book-curr-page-ed" 
                        min="0"
                        max={bookTotalPages}
                        value={bookCurrentPage}
                        onChange={(e) => setBookCurrentPage(Math.min(parseInt(e.target.value, 10) || 0, bookTotalPages))}
                      />
                    </InputWrapper>
                  )}
                </FormRow>

                <FormRow>
                  {bookStatus === 'Read' && (
                    <InputWrapper>
                      <InputLabel htmlFor="book-times-read-ed">Vezes Lido</InputLabel>
                      <SmallInput 
                        type="number" 
                        id="book-times-read-ed" 
                        min="0"
                        value={bookTimesRead}
                        onChange={(e) => setBookTimesRead(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      />
                    </InputWrapper>
                  )}

                  <InputWrapper>
                    <InputLabel>Sua Nota</InputLabel>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                      {bookRating > 0 && (
                        <button 
                          type="button"
                          onClick={() => setBookRating(0)}
                          style={{ background: 'none', border: 'none', color: 'var(--foreground-muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Sem nota
                        </button>
                      )}
                    </div>
                  </InputWrapper>
                </FormRow>

                <ModalActions style={{ justifyContent: 'space-between' }}>
                  <ActionButton $variant="danger" onClick={handleDeleteBook}>
                    Remover Livro
                  </ActionButton>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <ActionButton $variant="secondary" onClick={() => setEditingBook(null)}>
                      Cancelar
                    </ActionButton>
                    <ActionButton $variant="primary" style={{ background: 'var(--success)' }} onClick={handleUpdateBook}>
                      Salvar Alterações
                    </ActionButton>
                  </div>
                </ModalActions>
              </FormSection>
            </ModalDetails>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* MODAL: Adding new Course */}
      {isAddingCourse && (
        <ModalOverlay onClick={() => setIsAddingCourse(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <CloseButton onClick={() => setIsAddingCourse(false)}>✕</CloseButton>
            <ModalDetails style={{ padding: '30px' }}>
              <ShowHeader>
                <ShowTitle style={{ color: 'var(--accent)' }}>Adicionar Novo Curso</ShowTitle>
                <ShowYearMeta>Preencha os detalhes do curso para rastrear suas aulas e progresso</ShowYearMeta>
              </ShowHeader>

              <FormSection style={{ border: 'none', paddingTop: 0 }}>
                <InputWrapper>
                  <InputLabel htmlFor="course-title-in">Título *</InputLabel>
                  <SmallInput 
                    type="text" 
                    id="course-title-in" 
                    placeholder="Digite o nome do curso"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                  />
                </InputWrapper>

                <FormRow>
                  <InputWrapper>
                    <InputLabel htmlFor="course-platform-in">Plataforma</InputLabel>
                    <Select 
                      id="course-platform-in" 
                      value={coursePlatform} 
                      onChange={(e) => setCoursePlatform(e.target.value)}
                    >
                      <option value="Alura">Alura</option>
                      <option value="Udemy">Udemy</option>
                      <option value="Asimov">Asimov</option>
                      <option value="Hashtag">Hashtag</option>
                      <option value="YouTube">YouTube</option>
                      <option value="Microsoft Learn">Microsoft Learn</option>
                      <option value="Coursera">Coursera</option>
                      <option value="Pluralsight">Pluralsight</option>
                      <option value="Rocketseat">Rocketseat</option>
                      <option value="EBAC">EBAC</option>
                      <option value="Other">Outra (Especificar)</option>
                    </Select>
                  </InputWrapper>

                  {coursePlatform === 'Other' && (
                    <InputWrapper>
                      <InputLabel htmlFor="course-custom-platform-in">Especificar Plataforma</InputLabel>
                      <SmallInput 
                        type="text" 
                        id="course-custom-platform-in" 
                        placeholder="Ex: Hotmart, Pluralsight"
                        value={courseCustomPlatform}
                        onChange={(e) => setCourseCustomPlatform(e.target.value)}
                      />
                    </InputWrapper>
                  )}
                </FormRow>

                <FormRow>
                  <InputWrapper>
                    <InputLabel htmlFor="course-prog-type-in">Medir Progresso Por</InputLabel>
                    <Select 
                      id="course-prog-type-in" 
                      value={courseProgressType} 
                      onChange={(e) => setCourseProgressType(e.target.value as any)}
                    >
                      <option value="minutes">Minutos Assistidos</option>
                      <option value="hours">Horas Assistidas</option>
                    </Select>
                  </InputWrapper>

                  <InputWrapper>
                    <InputLabel htmlFor="course-status-in">Status do Curso</InputLabel>
                    <Select 
                      id="course-status-in" 
                      value={courseStatus} 
                      onChange={(e) => {
                        const newStatus = e.target.value as 'PlanToStart' | 'Studying' | 'Completed';
                        setCourseStatus(newStatus);
                        if (newStatus === 'PlanToStart') {
                          setCourseTimesCompleted(0);
                        } else if (newStatus === 'Completed' && courseTimesCompleted === 0) {
                          setCourseTimesCompleted(1);
                        }
                      }}
                    >
                      <option value="PlanToStart">Quero Começar</option>
                      <option value="Studying">Estudando</option>
                      <option value="Completed">Concluído</option>
                    </Select>
                  </InputWrapper>
                </FormRow>

                <FormRow>
                  {courseProgressType === 'minutes' ? (
                    <>
                      <InputWrapper>
                        <InputLabel htmlFor="course-total-min-in">Total de Minutos</InputLabel>
                        <SmallInput 
                          type="number" 
                          id="course-total-min-in" 
                          min="1"
                          value={courseTotalMinutes}
                          onChange={(e) => setCourseTotalMinutes(parseInt(e.target.value, 10) || 120)}
                        />
                      </InputWrapper>

                      {courseStatus === 'Studying' && (
                        <InputWrapper>
                          <InputLabel htmlFor="course-curr-min-in">Minutos Concluídos</InputLabel>
                          <SmallInput 
                            type="number" 
                            id="course-curr-min-in" 
                            min="0"
                            max={courseTotalMinutes}
                            value={courseCurrentMinutes}
                            onChange={(e) => setCourseCurrentMinutes(Math.min(parseInt(e.target.value, 10) || 0, courseTotalMinutes))}
                          />
                        </InputWrapper>
                      )}
                    </>
                  ) : (
                    <>
                      <InputWrapper>
                        <InputLabel htmlFor="course-total-hrs-in">Total de Horas</InputLabel>
                        <SmallInput 
                          type="number" 
                          id="course-total-hrs-in" 
                          min="1"
                          value={courseTotalHours}
                          onChange={(e) => setCourseTotalHours(parseInt(e.target.value, 10) || 10)}
                        />
                      </InputWrapper>

                      {courseStatus === 'Studying' && (
                        <InputWrapper>
                          <InputLabel htmlFor="course-curr-hrs-in">Horas Concluídas</InputLabel>
                          <SmallInput 
                            type="number" 
                            id="course-curr-hrs-in" 
                            min="0"
                            max={courseTotalHours}
                            value={courseCurrentHours}
                            onChange={(e) => setCourseCurrentHours(Math.min(parseInt(e.target.value, 10) || 0, courseTotalHours))}
                          />
                        </InputWrapper>
                      )}
                    </>
                  )}
                </FormRow>

                <FormRow>
                  {courseStatus === 'Completed' && (
                    <InputWrapper>
                      <InputLabel htmlFor="course-times-comp-in">Vezes Concluído</InputLabel>
                      <SmallInput 
                        type="number" 
                        id="course-times-comp-in" 
                        min="0"
                        value={courseTimesCompleted}
                        onChange={(e) => setCourseTimesCompleted(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      />
                    </InputWrapper>
                  )}

                  <InputWrapper>
                    <InputLabel>Sua Nota</InputLabel>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <StarRatingSelector>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarButton
                            key={star}
                            type="button"
                            $selected={star <= courseRating}
                            onClick={() => setCourseRating(star)}
                          >
                            ★
                          </StarButton>
                        ))}
                      </StarRatingSelector>
                      {courseRating > 0 && (
                        <button 
                          type="button"
                          onClick={() => setCourseRating(0)}
                          style={{ background: 'none', border: 'none', color: 'var(--foreground-muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Sem nota
                        </button>
                      )}
                    </div>
                  </InputWrapper>
                </FormRow>

                <ModalActions>
                  <ActionButton $variant="secondary" onClick={() => setIsAddingCourse(false)}>
                    Cancelar
                  </ActionButton>
                  <ActionButton $variant="primary" style={{ background: 'var(--accent)' }} onClick={handleSaveCourse}>
                    Adicionar Curso
                  </ActionButton>
                </ModalActions>
              </FormSection>
            </ModalDetails>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* MODAL: Editing Course */}
      {editingCourse && (
        <ModalOverlay onClick={() => setEditingCourse(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <CloseButton onClick={() => setEditingCourse(null)}>✕</CloseButton>
            <ModalDetails style={{ padding: '30px' }}>
              <ShowHeader>
                <ShowTitle style={{ color: 'var(--accent)' }}>Editar Curso</ShowTitle>
                <ShowYearMeta>Atualize suas informações de estudo e progresso</ShowYearMeta>
              </ShowHeader>

              <FormSection style={{ border: 'none', paddingTop: 0 }}>
                <InputWrapper>
                  <InputLabel htmlFor="course-title-ed">Título *</InputLabel>
                  <SmallInput 
                    type="text" 
                    id="course-title-ed" 
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                  />
                </InputWrapper>

                <FormRow>
                  <InputWrapper>
                    <InputLabel htmlFor="course-platform-ed">Plataforma</InputLabel>
                    <Select 
                      id="course-platform-ed" 
                      value={coursePlatform} 
                      onChange={(e) => setCoursePlatform(e.target.value)}
                    >
                      <option value="Alura">Alura</option>
                      <option value="Udemy">Udemy</option>
                      <option value="Asimov">Asimov</option>
                      <option value="Hashtag">Hashtag</option>
                      <option value="YouTube">YouTube</option>
                      <option value="Microsoft Learn">Microsoft Learn</option>
                      <option value="Coursera">Coursera</option>
                      <option value="Pluralsight">Pluralsight</option>
                      <option value="Rocketseat">Rocketseat</option>
                      <option value="EBAC">EBAC</option>
                      <option value="Other">Outra (Especificar)</option>
                    </Select>
                  </InputWrapper>

                  {coursePlatform === 'Other' && (
                    <InputWrapper>
                      <InputLabel htmlFor="course-custom-platform-ed">Especificar Plataforma</InputLabel>
                      <SmallInput 
                        type="text" 
                        id="course-custom-platform-ed" 
                        value={courseCustomPlatform}
                        onChange={(e) => setCourseCustomPlatform(e.target.value)}
                      />
                    </InputWrapper>
                  )}
                </FormRow>

                <FormRow>
                  <InputWrapper>
                    <InputLabel htmlFor="course-prog-type-ed">Medir Progresso Por</InputLabel>
                    <Select 
                      id="course-prog-type-ed" 
                      value={courseProgressType} 
                      onChange={(e) => setCourseProgressType(e.target.value as any)}
                    >
                      <option value="minutes">Minutos Assistidos</option>
                      <option value="hours">Horas Assistidas</option>
                    </Select>
                  </InputWrapper>

                  <InputWrapper>
                    <InputLabel htmlFor="course-status-ed">Status do Curso</InputLabel>
                    <Select 
                      id="course-status-ed" 
                      value={courseStatus} 
                      onChange={(e) => {
                        const newStatus = e.target.value as 'PlanToStart' | 'Studying' | 'Completed';
                        setCourseStatus(newStatus);
                        if (newStatus === 'PlanToStart') {
                          setCourseTimesCompleted(0);
                        } else if (newStatus === 'Completed' && courseTimesCompleted === 0) {
                          setCourseTimesCompleted(1);
                        }
                      }}
                    >
                      <option value="PlanToStart">Quero Começar</option>
                      <option value="Studying">Estudando</option>
                      <option value="Completed">Concluído</option>
                    </Select>
                  </InputWrapper>
                </FormRow>

                <FormRow>
                  {courseProgressType === 'minutes' ? (
                    <>
                      <InputWrapper>
                        <InputLabel htmlFor="course-total-min-ed">Total de Minutos</InputLabel>
                        <SmallInput 
                          type="number" 
                          id="course-total-min-ed" 
                          min="1"
                          value={courseTotalMinutes}
                          onChange={(e) => setCourseTotalMinutes(parseInt(e.target.value, 10) || 120)}
                        />
                      </InputWrapper>

                      {courseStatus === 'Studying' && (
                        <InputWrapper>
                          <InputLabel htmlFor="course-curr-min-ed">Minutos Concluídos</InputLabel>
                          <SmallInput 
                            type="number" 
                            id="course-curr-min-ed" 
                            min="0"
                            max={courseTotalMinutes}
                            value={courseCurrentMinutes}
                            onChange={(e) => setCourseCurrentMinutes(Math.min(parseInt(e.target.value, 10) || 0, courseTotalMinutes))}
                          />
                        </InputWrapper>
                      )}
                    </>
                  ) : (
                    <>
                      <InputWrapper>
                        <InputLabel htmlFor="course-total-hrs-ed">Total de Horas</InputLabel>
                        <SmallInput 
                          type="number" 
                          id="course-total-hrs-ed" 
                          min="1"
                          value={courseTotalHours}
                          onChange={(e) => setCourseTotalHours(parseInt(e.target.value, 10) || 10)}
                        />
                      </InputWrapper>

                      {courseStatus === 'Studying' && (
                        <InputWrapper>
                          <InputLabel htmlFor="course-curr-hrs-ed">Horas Concluídas</InputLabel>
                          <SmallInput 
                            type="number" 
                            id="course-curr-hrs-ed" 
                            min="0"
                            max={courseTotalHours}
                            value={courseCurrentHours}
                            onChange={(e) => setCourseCurrentHours(Math.min(parseInt(e.target.value, 10) || 0, courseTotalHours))}
                          />
                        </InputWrapper>
                      )}
                    </>
                  )}
                </FormRow>

                <FormRow>
                  {courseStatus === 'Completed' && (
                    <InputWrapper>
                      <InputLabel htmlFor="course-times-comp-ed">Vezes Concluído</InputLabel>
                      <SmallInput 
                        type="number" 
                        id="course-times-comp-ed" 
                        min="0"
                        value={courseTimesCompleted}
                        onChange={(e) => setCourseTimesCompleted(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      />
                    </InputWrapper>
                  )}

                  <InputWrapper>
                    <InputLabel>Sua Nota</InputLabel>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <StarRatingSelector>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarButton
                            key={star}
                            type="button"
                            $selected={star <= courseRating}
                            onClick={() => setCourseRating(star)}
                          >
                            ★
                          </StarButton>
                        ))}
                      </StarRatingSelector>
                      {courseRating > 0 && (
                        <button 
                          type="button"
                          onClick={() => setCourseRating(0)}
                          style={{ background: 'none', border: 'none', color: 'var(--foreground-muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Sem nota
                        </button>
                      )}
                    </div>
                  </InputWrapper>
                </FormRow>

                <ModalActions style={{ justifyContent: 'space-between' }}>
                  <ActionButton $variant="danger" onClick={handleDeleteCourse}>
                    Remover Curso
                  </ActionButton>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <ActionButton $variant="secondary" onClick={() => setEditingCourse(null)}>
                      Cancelar
                    </ActionButton>
                    <ActionButton $variant="primary" style={{ background: 'var(--accent)' }} onClick={handleUpdateCourse}>
                      Salvar Alterações
                    </ActionButton>
                  </div>
                </ModalActions>
              </FormSection>
            </ModalDetails>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}
