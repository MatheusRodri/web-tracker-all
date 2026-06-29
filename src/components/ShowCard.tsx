import React from 'react';
import { TrackedShow } from '@/lib/firestore';
import { renderStars } from '../utils/helpers';
import {
  ShowCardContainer,
  OrderBadge,
  CardPoster,
  CardBody,
  CardTitle,
  CardMeta,
  StatusBadge,
  PlatformBadge,
  RatingStars,
  CardProgress
} from '../app/styles';

interface ShowCardProps {
  show: TrackedShow;
  onClick: () => void;
}

/**
 * ShowCard component displaying details of a tracked show (movie or series) in a card format.
 * 
 * @param props - Component props containing the show data and click handler
 * @returns React component rendering the show card
 */
export const ShowCard: React.FC<ShowCardProps> = ({ show, onClick }) => {
  return (
    <ShowCardContainer onClick={onClick} data-testid="show-card">
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
            show.timesWatched !== undefined && show.timesWatched !== null && show.timesWatched > 1 && (
              <CardProgress style={{ color: 'var(--primary)' }}>
                Visto {show.timesWatched}x
              </CardProgress>
            )
          )}
        </CardMeta>
      </CardBody>
    </ShowCardContainer>
  );
};
