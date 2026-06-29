import React, { useState, useEffect } from 'react';
import { deleteShow, updateShow, TrackedShow } from '@/lib/firestore';
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

interface EditShowModalProps {
  show: TrackedShow | null;
  onClose: () => void;
}

/**
 * EditShowModal component allowing editing of an existing tracked show (movie or series)
 * and deletion from the catalog.
 * 
 * @param props - Component props containing the show data and close handler
 * @returns React modal component for editing a show
 */
export const EditShowModal: React.FC<EditShowModalProps> = ({ show, onClose }) => {
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
  const [watchOrder, setWatchOrder] = useState<number | ''>(1);
  
  const [currentSeason, setCurrentSeason] = useState<number | ''>(1);
  const [currentEpisode, setCurrentEpisode] = useState<number | ''>(1);
  const [seasonsCount, setSeasonsCount] = useState<number | ''>(1);
  const [episodesCount, setEpisodesCount] = useState<number | ''>(12);

  // Load show details when show prop changes
  useEffect(() => {
    if (show) {
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

      setTimesWatched(show.timesWatched !== undefined && show.timesWatched !== null ? show.timesWatched : (show.status === 'Watched' ? 1 : 0));
      setWatchOrder(show.watchOrder !== undefined && show.watchOrder !== null ? show.watchOrder : '');
      if (show.type === 'series') {
        setCurrentSeason(show.currentSeason !== undefined && show.currentSeason !== null ? show.currentSeason : '');
        setCurrentEpisode(show.currentEpisode !== undefined && show.currentEpisode !== null ? show.currentEpisode : '');
        setSeasonsCount(show.seasonsCount !== undefined && show.seasonsCount !== null ? show.seasonsCount : '');
        setEpisodesCount(show.episodesCount !== undefined && show.episodesCount !== null ? show.episodesCount : '');
      }
    }
  }, [show]);

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
   * Updates the current show catalog record in Firestore with modified form fields.
   */
  const handleUpdate = async () => {
    if (!show || !showTitle.trim()) return;

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
      await updateShow(show.id, updatedFields);
      onClose();
    } catch (err) {
      console.error('Failed to update show:', err);
    }
  };

  /**
   * Prompts the user and deletes the current show catalog record from Firestore.
   */
  const handleDelete = async () => {
    if (!show) return;
    if (confirm(`Tem certeza que deseja remover "${show.title}" de sua lista?`)) {
      try {
        await deleteShow(show.id);
        onClose();
      } catch (err) {
        console.error('Failed to delete show:', err);
      }
    }
  };

  if (!show) return null;

  return (
    <ModalOverlay onClick={onClose} data-testid="edit-show-modal">
      <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px' }}>
        <CloseButton onClick={onClose}>✕</CloseButton>
        
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '24px', background: 'linear-gradient(135deg, #ffffff 30%, var(--primary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', padding: '20px 40px 0' }}>
          Editar Show (Filme ou Série)
        </h3>

        <ModalGrid>
          <ModalPosterContainer>
            <ModalPoster src={showPoster || '/file.svg'} alt={showTitle} />
            {!showPoster ? (
              <InputWrapper style={{ width: '100%' }}>
                <InputLabel htmlFor="edit-poster">URL da Imagem de Capa</InputLabel>
                <SmallInput 
                  type="text" 
                  id="edit-poster" 
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
                    onChange={(e) => setShowType(e.target.value as 'movie' | 'series')}
                  >
                    <option value="movie">Filme</option>
                    <option value="series">Série</option>
                  </Select>
                </InputWrapper>
              </FormRow>

              <FormRow>
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
                  <InputLabel htmlFor="edit-genre">Gêneros</InputLabel>
                  <SmallInput 
                    type="text" 
                    id="edit-genre" 
                    value={showGenre}
                    onChange={(e) => setShowGenre(e.target.value)}
                  />
                </InputWrapper>
              </FormRow>

              <FormRow>
                <InputWrapper>
                  <InputLabel htmlFor="edit-director">Diretor / Criador</InputLabel>
                  <SmallInput 
                    type="text" 
                    id="edit-director" 
                    value={showDirector}
                    onChange={(e) => setShowDirector(e.target.value)}
                  />
                </InputWrapper>

                <InputWrapper>
                  <InputLabel htmlFor="edit-runtime">Duração</InputLabel>
                  <SmallInput 
                    type="text" 
                    id="edit-runtime" 
                    placeholder="Ex: 120 min"
                    value={showRuntime}
                    onChange={(e) => setShowRuntime(e.target.value)}
                  />
                </InputWrapper>
              </FormRow>

              <FormRow>
                <InputWrapper>
                  <InputLabel htmlFor="edit-production">Produção / Network</InputLabel>
                  <SmallInput 
                    type="text" 
                    id="edit-production" 
                    placeholder="Ex: Warner Bros, HBO"
                    value={showProduction}
                    onChange={(e) => setShowProduction(e.target.value)}
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
              </FormRow>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '20px' }}>
                <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--primary)' }}>Sua Avaliação & Status</h4>
                
                <FormRow>
                  <InputWrapper>
                    <InputLabel htmlFor="edit-status">Status</InputLabel>
                    <Select 
                      id="edit-status" 
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
                    <InputLabel htmlFor="edit-platform">Onde Assistir</InputLabel>
                    <Select 
                      id="edit-platform" 
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
                      <InputLabel htmlFor="edit-custom-platform">Especifique a Plataforma</InputLabel>
                      <SmallInput 
                        type="text" 
                        id="edit-custom-platform" 
                        placeholder="Ex: Cinema, Torrent..."
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
                      onChange={(e) => setTimesWatched(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10) || 0))}
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
                    <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--accent)' }}>Dados da Série</h4>
                    <FormRow>
                      <InputWrapper>
                        <InputLabel htmlFor="edit-seasons">Total de Temporadas</InputLabel>
                        <SmallInput 
                          type="number" 
                          id="edit-seasons" 
                          min="0"
                          value={seasonsCount}
                          onChange={(e) => setSeasonsCount(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10) || 0))}
                        />
                      </InputWrapper>

                      <InputWrapper>
                        <InputLabel htmlFor="edit-episodes">Total de Episódios</InputLabel>
                        <SmallInput 
                          type="number" 
                          id="edit-episodes" 
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
                          <InputLabel htmlFor="edit-cur-season">Temporada Atual</InputLabel>
                          <SmallInput 
                            type="number" 
                            id="edit-cur-season" 
                            min="0"
                            max={seasonsCount !== '' ? seasonsCount : undefined}
                            value={currentSeason}
                            onChange={(e) => setCurrentSeason(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10) || 0))}
                          />
                        </InputWrapper>

                        <InputWrapper>
                          <InputLabel htmlFor="edit-cur-episode">Episódio Atual</InputLabel>
                          <SmallInput 
                            type="number" 
                            id="edit-cur-episode" 
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

              <ModalActions style={{ justifyContent: 'space-between' }}>
                <ActionButton $variant="danger" type="button" onClick={handleDelete}>
                  Remover da Lista
                </ActionButton>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <ActionButton $variant="secondary" type="button" onClick={onClose}>
                    Cancelar
                  </ActionButton>
                  <ActionButton $variant="primary" type="button" onClick={handleUpdate} disabled={!showTitle.trim()}>
                    Salvar Alterações
                  </ActionButton>
                </div>
              </ModalActions>
            </FormSection>
          </ModalDetails>
        </ModalGrid>
      </ModalContent>
    </ModalOverlay>
  );
};
