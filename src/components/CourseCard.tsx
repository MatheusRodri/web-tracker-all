import React from 'react';
import { TrackedCourse } from '@/lib/firestore';
import { renderStars } from '../utils/helpers';
import {
  CourseCardContainer,
  CourseHeaderPlaceholder,
  CoursePlatformIcon,
  CardBody,
  CardMeta,
  CourseStatusBadge,
  PlatformBadge,
  ProgressBarContainer,
  ProgressBarFill,
  RatingStars
} from '../app/styles';

interface CourseCardProps {
  course: TrackedCourse;
  onClick: () => void;
}

/**
 * CourseCard component displaying details of a tracked course in a card format with a visual progress bar.
 * 
 * @param props - Component props containing the course data and click handler
 * @returns React component rendering the course card
 */
export const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  const isMinutes = course.progressType === 'minutes';
  const current = isMinutes ? (course.currentMinutes || 0) : (course.currentHours || 0);
  const total = isMinutes ? (course.totalMinutes || 1) : (course.totalHours || 1);
  const progressPercentage = total > 0 
    ? Math.round((current / total) * 100) 
    : 0;

  return (
    <CourseCardContainer onClick={onClick} data-testid="course-card">
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
    </CourseCardContainer>
  );
};
