import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { addShow, TrackedShow } from '@/lib/firestore';
import { STREAMING_PLATFORMS } from '../utils/helpers';
import { OMBDetailResponse, OMBSearchResponse } from '../app/api/search/route';
import {
  ModalOverlay,
  ModalContent,
  CloseButton,
  InputLabel,
  InputWrapper,
  Select,
  SmallInput,
  StarRatingSelector,
  StarButton,
  ModalActions,
  ActionButton,
  ImportTabContainer,
  ImportTabButton,
  ImportRowList,
  ImportRowItem
} from '../app/styles';

interface ImportShowsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ImportItem {
  id: number;
  rawTitle: string;
  searchQuery: string;
  match: {
    Title: string;
    Year: string;
    imdbID: string;
    Type: string;
    Poster: string;
  } | null;
  isSearching: boolean;
  status: 'Unwatched' | 'Watching' | 'Watched';
  platform: string;
  rating: number;
  timesWatched: number;
  watchOrder: number | '';
  selected: boolean;
}

/**
 * ImportShowsModal component handles bulk importing of shows (movies and series)
 * using text lists or uploaded CSV files. It fetches metadata via OMDB API.
 * 
 * @param props - Component props containing visibility state and close callback
 * @returns React modal component for bulk importing
 */
export const ImportShowsModal: React.FC<ImportShowsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  // Import configuration states
  const [importActiveTab, setImportActiveTab] = useState<'text' | 'csv'>('text');
  const [importRawList, setImportRawList] = useState('');
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1);
  const [importItems, setImportItems] = useState<ImportItem[]>([]);

  // Default values for missing properties
  const [importGlobalStatus, setImportGlobalStatus] = useState<'Unwatched' | 'Watching' | 'Watched'>('Unwatched');
  const [importGlobalPlatform, setImportGlobalPlatform] = useState('Netflix');
  const [importGlobalRating, setImportGlobalRating] = useState<number>(0);
  const [importGlobalTimesWatched, setImportGlobalTimesWatched] = useState<number>(0);

  // Import progress tracking
  const [importIsSaving, setImportIsSaving] = useState(false);
  const [importProgressTotal, setImportProgressTotal] = useState(0);
  const [importProgressCurrent, setImportProgressCurrent] = useState(0);

  /**
   * Helper to parse raw CSV file text into structured item fields.
   * 
   * @param csvText - Raw text read from a CSV file
   * @returns Array of imported items matching columns or defaults
   */
  const parseCSV = (csvText: string): ImportItem[] => {
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
    const dataRows: ImportItem[] = [];

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

  /**
   * Processes a manually pasted raw text list of show titles.
   */
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

  /**
   * Handles files uploaded via the file input element, triggering CSV parsing.
   * 
   * @param e - Input change event containing the uploaded file reference
   */
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

  /**
   * Resolves search matches for a list of items sequentially using OMDb search endpoint.
   * 
   * @param itemsList - List of items to search OMDb matches for
   */
  const resolveAllMatches = async (itemsList: ImportItem[]) => {
    const updatedItems = [...itemsList];
    setImportItems(updatedItems.map(item => ({ ...item, isSearching: true })));

    for (let i = 0; i < updatedItems.length; i++) {
      const item = updatedItems[i];
      try {
        const res = await fetch(`/api/search?s=${encodeURIComponent(item.searchQuery)}`);
        const data: OMBSearchResponse = await res.json();
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

  /**
   * Performs manual search override for a single item row in suggestions view.
   * 
   * @param itemId - Unique ID of the row item
   * @param query - The new search query string
   */
  const handleRowSearch = async (itemId: number, query: string) => {
    setImportItems(prev => prev.map(item => item.id === itemId ? { ...item, isSearching: true, searchQuery: query } : item));
    try {
      const res = await fetch(`/api/search?s=${encodeURIComponent(query)}`);
      const data: OMBSearchResponse = await res.json();
      const searchResults = data.Search;
      if (data.Response === 'True' && searchResults && searchResults.length > 0) {
        setImportItems(prev => prev.map(item => item.id === itemId ? { 
          ...item, 
          match: searchResults[0], 
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

  /**
   * Applies a configuration change to all selected/marked import rows.
   * 
   * @param field - Field name to update ('status', 'platform', or 'rating')
   * @param value - The value to apply
   */
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

  /**
   * Confirms, retrieves detailed metadata, and commits selected records to Firestore.
   */
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
      if (!item.match) continue;
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
        console.error('Import failed for item:', item.rawTitle, err);
      }
      setImportProgressCurrent(prev => prev + 1);
    }
    setImportIsSaving(false);
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={() => { if (!importIsSaving) onClose(); }} data-testid="import-shows-modal">
      <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '950px', padding: '30px' }}>
        <CloseButton onClick={onClose} disabled={importIsSaving}>×</CloseButton>
        
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
              <ActionButton $variant="secondary" onClick={onClose}>Cancelar</ActionButton>
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
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '20px' }}>⏳</span>
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
                <ActionButton $variant="primary" style={{ margin: '0 auto', display: 'block' }} onClick={onClose}>
                  Fechar
                </ActionButton>
              </div>
            )}
          </div>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};
