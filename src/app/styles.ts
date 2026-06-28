import styled, { keyframes, css } from 'styled-components';

// CSS Keyframes for smooth animations
export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const pulseGlow = keyframes`
  0% { box-shadow: 0 0 5px var(--accent-glow); }
  50% { box-shadow: 0 0 15px var(--accent); }
  100% { box-shadow: 0 0 5px var(--accent-glow); }
`;

export const Container = styled.div`
  min-height: 100vh;
  background-color: #07070a;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  font-family: var(--font-sans);
`;

export const Header = styled.header`
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

export const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #ffffff 30%, var(--primary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
`;

export const UserActions = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const MenuButton = styled.button`
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

export const MobileDropdownMenu = styled.div`
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

export const UserEmail = styled.span`
  color: var(--foreground-muted);
  font-size: 0.9rem;
`;

export const LogoutButton = styled.button`
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

export const MainContent = styled.main`
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
export const CategoryTabsContainer = styled.div`
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

export const CategoryTabButton = styled.button<{ $active: boolean; $category: 'shows' | 'books' | 'courses' }>`
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

export const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

export const SearchInput = styled.input`
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

export const SuggestionsDropdown = styled.div`
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

export const SuggestionItem = styled.div`
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

export const SuggestionPoster = styled.img`
  width: 40px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  background-color: #1a1a24;
`;

export const SuggestionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const SuggestionTitle = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
`;

export const SuggestionMeta = styled.div`
  font-size: 0.8rem;
  color: var(--foreground-muted);
  text-transform: capitalize;
`;

export const FilterSection = styled.div`
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

export const TabList = styled.div`
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

export const TabButton = styled.button<{ $active: boolean }>`
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

export const LocalSearchInput = styled.input`
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

export const ShowsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
  animation: ${fadeIn} 0.4s ease;
`;

export const ShowCardContainer = styled.div`
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

export const CardPoster = styled.img`
  width: 100%;
  height: 280px;
  object-fit: cover;
  background-color: #13131c;
`;

export const OrderBadge = styled.div`
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
export const BookCardContainer = styled.div`
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

export const BookCoverPlaceholder = styled.div`
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

export const BookCoverTitle = styled.div`
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

export const BookCoverAuthor = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
`;

// Course Card Styles
export const CourseCardContainer = styled.div`
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

export const CourseHeaderPlaceholder = styled.div`
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

export const CoursePlatformIcon = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #ffffff;
  backdrop-filter: blur(5px);
`;

export const ProgressBarContainer = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 4px;
`;

export const ProgressBarFill = styled.div<{ $progress: number; $color?: string }>`
  width: ${props => Math.min(Math.max(props.$progress, 0), 100)}%;
  height: 100%;
  background: ${props => props.$color || 'var(--primary)'};
  transition: width 0.3s ease;
`;

export const CardBody = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
`;

export const CardTitle = styled.h3`
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

export const CardMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--foreground-muted);
`;

export const CardProgress = styled.div`
  font-size: 0.85rem;
  color: var(--accent);
  font-weight: 600;
`;

export const StatusBadge = styled.span<{ $status: 'Unwatched' | 'Watching' | 'Watched' }>`
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

export const BookStatusBadge = styled.span<{ $status: 'PlanToRead' | 'Reading' | 'Read' }>`
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

export const CourseStatusBadge = styled.span<{ $status: 'PlanToStart' | 'Studying' | 'Completed' }>`
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

export const PlatformBadge = styled.span`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 0.75rem;
  color: var(--foreground-muted);
`;

export const RatingStars = styled.div`
  display: flex;
  gap: 2px;
  color: #fbbf24;
  font-size: 0.9rem;
`;

// Modal overlay and container
export const ModalOverlay = styled.div`
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

export const ModalContent = styled.div`
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

export const CloseButton = styled.button`
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

export const ModalGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  
  @media (min-width: 600px) {
    grid-template-columns: 280px 1fr;
  }
`;

export const ModalPosterContainer = styled.div`
  position: relative;
  background-color: #101017;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 20px;
  gap: 16px;
  
  @media (max-width: 599px) {
    max-height: 300px;
  }
`;

export const ModalPoster = styled.img`
  width: 100%;
  height: 100%;
  max-height: 500px;
  object-fit: cover;
  
  @media (max-width: 599px) {
    width: auto;
    max-height: 300px;
  }
`;

export const ModalDetails = styled.div`
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const ShowHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const ShowTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1.2;
`;

export const ShowYearMeta = styled.span`
  font-size: 0.95rem;
  color: var(--foreground-muted);
`;

export const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  padding: 16px;
  border-radius: 8px;
  font-size: 0.85rem;
`;

export const MetaItem = styled.div`
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

export const FormSection = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const InputLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--foreground);
  letter-spacing: 0.5px;
`;

export const Select = styled.select`
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

export const SortSelect = styled(Select)`
  width: auto;
  padding: 8px 12px;
  font-size: 0.9rem;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
    padding: 6px 10px;
  }
`;

export const SmallInput = styled.input`
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

export const StarRatingSelector = styled.div`
  display: flex;
  gap: 6px;
`;

export const StarButton = styled.button<{ $selected: boolean }>`
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

export const ImportTabContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 10px;
`;

export const ImportTabButton = styled.button<{ $active: boolean }>`
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

export const ImportRowList = styled.div`
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

export const ImportRowItem = styled.div<{ $selected: boolean; $hasMatch: boolean }>`
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

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
`;

export const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' | 'secondary' }>`
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

export const EmptyState = styled.div`
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

export const EmptyTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
`;

export const EmptyText = styled.p`
  color: var(--foreground-muted);
  font-size: 0.9rem;
  line-height: 1.6;
`;
