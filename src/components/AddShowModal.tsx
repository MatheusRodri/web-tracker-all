import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { addShow, TrackedShow } from '@/lib/firestore';
import { STREAMING_PLATFORMS, renderStars } from '../utils/helpers';
import {
  ModalOverlay,
  ModalContent,
  CloseButton,
  ModalGrid,
  ModalPosterContainer,
  ModalPoster,
  InputWrapper,
  InputLabel,
  SmallInput,
  ModalDetails,
  FormSection,
  FormRow,
  Select,
  StarRatingSelector,
  StarButton,
  ModalActions,
  ActionButton
} from '../app/styles';

interface AddShowModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Partial<TrackedShow> | null;
}

/**
 * AddShowModal component to add a movie or series manually or from search suggestions.
 * 
 * @param props - Component props containing visibility state, close callback, and initial search details
 * @returns React modal component for adding a show
 */
export const AddShowModal: React.FC<AddShowModalProps> = ({ isOpen, onClose, initialData }) => {
  const { user } = useAuth();

  // Form states
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

  const [status, setStatus] = useState<'Unwatched' | 'Watching' | 'Watched'>('Unwatched');
  const [rating, setRating] = useState<number>(0);
  const [platform, setPlatform] = useState('Netflix');
  const [customPlatform, setCustomPlatform] = useState('');
  const [timesWatched, setTimesWatched] = useState<number | ''>(1);
  const [watchOrder, setWatchOrder] = useState<number | ''>('');
  
  const [currentSeason, setCurrentSeason] = useState<number | ''>(1);
  const [currentEpisode, setCurrentEpisode] = useState<number | ''>(1);
  const [seasonsCount, setSeasonsCount] = useState<number | ''>(1);
  const [episodesCount, setEpisodesCount] = useState<number | ''>(12);

  // Initialize form when initialData or modal status changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setShowTitle(initialData.title || '');
        setShowType(initialData.type || 'movie');
        setShowYear(initialData.year || '');
        setShowGenre(initialData.genre || '');
        setShowDirector(initialData.director || '');
        setShowRuntime(initialData.runtime || '');
        setShowProduction(initialData.production || '');
        setShowCountry(initialData.country || '');
        setShowPoster(initialData.poster || '');
        setShowImdbID(initialData.imdbID || '');
        
        setStatus('Unwatched');
        setRating(0);
        setPlatform('Netflix');
        setCustomPlatform('');
        setTimesWatched(0);
        setWatchOrder('');
        setCurrentSeason(1);
        setCurrentEpisode(1);
        setSeasonsCount(initialData.seasonsCount !== undefined ? initialData.seasonsCount : 1);
        setEpisodesCount(12);
      } else {
        // Clear form for manual entry
        setShowTitle('');
        setShowType('movie');
        setShowYear('');
        setShowGenre('');
        setShowDirector('');
        setShowRuntime('');
        setShowProduction('');
        setShowCountry('');
        setShowPoster('');
        setShowImdbID('manual');
        
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
      }
    }
  }, [isOpen, initialData]);

  // Adjust timesWatched automatically based on status changes
  const handleStatusChange = (newStatus: 'Unwatched' | 'Watching' | 'Watched') => {
    setStatus(newStatus);
    if (newStatus === 'Unwatched') {
      setTimesWatched(0);
    } else if (newStatus === 'Watched' && (timesWatched === 0 || timesWatched === '')) {
      setTimesWatched(1);
    }
  };

  /**
   * Submits the form data to Firestore to create a new tracked show.
   */
  const handleSave = async () => {
    if (!user || !showTitle.trim()) return;

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
      timesWatched: timesWatched !== '' ? timesWatched : (status === 'Watched' ? 1 : 0),
      watchOrder: watchOrder !== '' ? watchOrder : null,
      ...(showType === 'series' ? {
        seasonsCount: seasonsCount !== '' ? seasonsCount : undefined,
        episodesCount: episodesCount !== '' ? episodesCount : undefined,
        currentSeason: currentSeason !== '' ? currentSeason : undefined,
        currentEpisode: currentEpisode !== '' ? currentEpisode : undefined
      } : {})
    };

    try {
      await addShow(user.uid, newShow);
      onClose();
    } catch (err) {
      console.error('Failed to save show:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose} data-testid="add-show-modal">
      <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px' }}>
        <CloseButton onClick={onClose}>✕</CloseButton>
        
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '24px', background: 'linear-gradient(135deg, #ffffff 30%, var(--primary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', padding: '20px 40px 0' }}>
          Adicionar Show (Filme ou Série)
        </h3>

        <ModalGrid>
          <ModalPosterContainer>
            <ModalPoster 
              src={showPoster || '/file.svg'} 
              alt={showTitle || 'Poster Preview'} 
            />
            {!showPoster ? (
              <InputWrapper style={{ width: '100%' }}>
                <InputLabel htmlFor="add-poster">URL da Imagem de Capa</InputLabel>
                <SmallInput 
                  type="text" 
                  id="add-poster" 
                  placeholder="https://exemplo.com/poster.jpg"
                  value={showPoster}
                  onChange={(e) => setShowPoster(e.target.value)}
                />
              </InputWrapper>
            ) : (
              <ActionButton 
                $variant="secondary" 
                type="button"
                style={{ width: '100%', fontSize: '0.8rem', padding: '8px 16px' }} 
                onClick={() => setShowPoster('')}
              >
                Remover Capa
              </ActionButton>
            )}
          </ModalPosterContainer>
          
          <ModalDetails>
            <FormSection>
              <FormRow>
                <InputWrapper>
                  <InputLabel htmlFor="add-title">Título *</InputLabel>
                  <SmallInput 
                    type="text" 
                    id="add-title" 
                    required
                    value={showTitle}
                    onChange={(e) => setShowTitle(e.target.value)}
                  />
                </InputWrapper>

                <InputWrapper>
                  <InputLabel htmlFor="add-type">Tipo</InputLabel>
                  <Select 
                    id="add-type" 
                    value={showType}
                    onChange={(e) => setShowType(e.target.value as 'movie' | 'series')}
                  >
                    <option value="movie">Filme</option>
                    <option value="series">Série</option>
                  </Select>
                </InputWrapper>
              </FormRow>

              <FormRow>
                <InputWrapper>
                  <InputLabel htmlFor="add-year">Ano</InputLabel>
                  <SmallInput 
                    type="text" 
                    id="add-year" 
                    value={showYear}
                    onChange={(e) => setShowYear(e.target.value)}
                  />
                </InputWrapper>

                <InputWrapper>
                  <InputLabel htmlFor="add-genre">Gêneros</InputLabel>
                  <SmallInput 
                    type="text" 
                    id="add-genre" 
                    value={showGenre}
                    onChange={(e) => setShowGenre(e.target.value)}
                  />
                </InputWrapper>
              </FormRow>

              <FormRow>
                <InputWrapper>
                  <InputLabel htmlFor="add-director">Diretor / Criador</InputLabel>
                  <SmallInput 
                    type="text" 
                    id="add-director" 
                    value={showDirector}
                    onChange={(e) => setShowDirector(e.target.value)}
                  />
                </InputWrapper>

                <InputWrapper>
                  <InputLabel htmlFor="add-runtime">Duração</InputLabel>
                  <SmallInput 
                    type="text" 
                    id="add-runtime" 
                    placeholder="Ex: 120 min"
                    value={showRuntime}
                    onChange={(e) => setShowRuntime(e.target.value)}
                  />
                </InputWrapper>
              </FormRow>

              <FormRow>
                <InputWrapper>
                  <InputLabel htmlFor="add-production">Produção / Network</InputLabel>
                  <SmallInput 
                    type="text" 
                    id="add-production" 
                    placeholder="Ex: Warner Bros, HBO"
                    value={showProduction}
                    onChange={(e) => setShowProduction(e.target.value)}
                  />
                </InputWrapper>

                <InputWrapper>
                  <InputLabel htmlFor="add-country">País</InputLabel>
                  <SmallInput 
                    type="text" 
                    id="add-country" 
                    value={showCountry}
                    onChange={(e) => setShowCountry(e.target.value)}
                  />
                </InputWrapper>
              </FormRow>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '20px' }}>
                <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--primary)' }}>Sua Avaliação & Status</h4>
                
                <FormRow>
                  <InputWrapper>
                    <InputLabel htmlFor="add-status">Status</InputLabel>
                    <Select 
                      id="add-status" 
                      value={status}
                      onChange={(e) => handleStatusChange(e.target.value as any)}
                    >
                      <option value="Unwatched">Não Assistido</option>
                      <option value="Watching">Assistindo</option>
                      <option value="Watched">Assistido</option>
                    </Select>
                  </InputWrapper>

                  <InputWrapper>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <InputLabel>Sua Nota</InputLabel>
                      {rating > 0 && (
                        <button 
                          type="button" 
                          onClick={() => setRating(0)}
                          style={{ background: 'none', border: 'none', color: 'var(--foreground-muted)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Limpar nota
                        </button>
                      )}
                    </div>
                    <StarRatingSelector style={{ marginTop: '8px' }}>
                      {renderStars(rating).map((star, idx) => (
                        <StarButton 
                          key={idx} 
                          type="button"
                          $selected={idx < rating}
                          onClick={() => setRating(idx + 1)}
                        >
                          ★
                        </StarButton>
                      ))}
                      <span style={{ marginLeft: '8px', fontSize: '0.85rem', color: 'var(--foreground-muted)', alignSelf: 'center' }}>
                        {rating > 0 ? `${rating}/5` : 'Sem nota'}
                      </span>
                    </StarRatingSelector>
                  </InputWrapper>
                </FormRow>

                <FormRow>
                  <InputWrapper>
                    <InputLabel htmlFor="add-platform">Onde Assistir</InputLabel>
                    <Select 
                      id="add-platform" 
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                    >
                      {STREAMING_PLATFORMS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                      <option value="Other">Outro</option>
                    </Select>
                  </InputWrapper>

                  {platform === 'Other' && (
                    <InputWrapper>
                      <InputLabel htmlFor="add-custom-platform">Especifique a Plataforma</InputLabel>
                      <SmallInput 
                        type="text" 
                        id="add-custom-platform" 
                        placeholder="Ex: Cinema, Torrent..."
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
                      onChange={(e) => setTimesWatched(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10) || 0))}
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
                    <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--accent)' }}>Dados da Série</h4>
                    <FormRow>
                      <InputWrapper>
                        <InputLabel htmlFor="add-seasons">Total de Temporadas</InputLabel>
                        <SmallInput 
                          type="number" 
                          id="add-seasons" 
                          min="0"
                          value={seasonsCount}
                          onChange={(e) => setSeasonsCount(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10) || 0))}
                        />
                      </InputWrapper>

                      <InputWrapper>
                        <InputLabel htmlFor="add-episodes">Total de Episódios (Estimado)</InputLabel>
                        <SmallInput 
                          type="number" 
                          id="add-episodes" 
                          min="0"
                          value={episodesCount}
                          onChange={(e) => setEpisodesCount(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10) || 0))}
                        />
                      </InputWrapper>
                    </FormRow>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '20px' }}>
                      <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--accent)' }}>Progresso da Série</h4>
                      <FormRow>
                        <InputWrapper>
                          <InputLabel htmlFor="add-cur-season">Temporada Atual</InputLabel>
                          <SmallInput 
                            type="number" 
                            id="add-cur-season" 
                            min="0"
                            max={seasonsCount !== '' ? seasonsCount : undefined}
                            value={currentSeason}
                            onChange={(e) => setCurrentSeason(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10) || 0))}
                          />
                        </InputWrapper>

                        <InputWrapper>
                          <InputLabel htmlFor="add-cur-episode">Episódio Atual</InputLabel>
                          <SmallInput 
                            type="number" 
                            id="add-cur-episode" 
                            min="0"
                            value={currentEpisode}
                            onChange={(e) => setCurrentEpisode(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10) || 0))}
                          />
                        </InputWrapper>
                      </FormRow>
                    </div>
                  </div>
                )}
              </div>

              <ModalActions>
                <ActionButton $variant="secondary" type="button" onClick={onClose}>
                  Cancelar
                </ActionButton>
                <ActionButton $variant="primary" type="button" onClick={handleSave} disabled={!showTitle.trim()}>
                  Adicionar à Lista
                </ActionButton>
              </ModalActions>
            </FormSection>
          </ModalDetails>
        </ModalGrid>
      </ModalContent>
    </ModalOverlay>
  );
};
