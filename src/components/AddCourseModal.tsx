import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { addCourse, TrackedCourse } from '@/lib/firestore';
import { COURSE_PLATFORMS } from '../utils/helpers';
import {
  ModalOverlay,
  ModalContent,
  CloseButton,
  ModalDetails,
  ShowHeader,
  ShowTitle,
  ShowYearMeta,
  FormSection,
  InputWrapper,
  InputLabel,
  SmallInput,
  FormRow,
  Select,
  StarRatingSelector,
  StarButton,
  ModalActions,
  ActionButton
} from '../app/styles';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * AddCourseModal component to add a course catalog record to the tracking list.
 * 
 * @param props - Component props containing visibility state and close callback
 * @returns React modal component for adding a course
 */
export const AddCourseModal: React.FC<AddCourseModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  // Form states
  const [courseTitle, setCourseTitle] = useState('');
  const [coursePlatform, setCoursePlatform] = useState('Udemy');
  const [courseCustomPlatform, setCourseCustomPlatform] = useState('');
  const [courseStatus, setCourseStatus] = useState<'PlanToStart' | 'Studying' | 'Completed'>('PlanToStart');
  const [courseRating, setCourseRating] = useState<number>(0);
  const [courseTimesCompleted, setCourseTimesCompleted] = useState<number>(0);
  const [courseProgressType, setCourseProgressType] = useState<'minutes' | 'hours'>('minutes');
  
  const [courseTotalMinutes, setCourseTotalMinutes] = useState<number>(120);
  const [courseCurrentMinutes, setCourseCurrentMinutes] = useState<number>(0);
  const [courseTotalHours, setCourseTotalHours] = useState<number>(10);
  const [courseCurrentHours, setCourseCurrentHours] = useState<number>(0);

  // Reset form fields when modal closes or opens
  useEffect(() => {
    if (isOpen) {
      setCourseTitle('');
      setCoursePlatform('Udemy');
      setCourseCustomPlatform('');
      setCourseStatus('PlanToStart');
      setCourseRating(0);
      setCourseTimesCompleted(0);
      setCourseProgressType('minutes');
      setCourseTotalMinutes(120);
      setCourseCurrentMinutes(0);
      setCourseTotalHours(10);
      setCourseCurrentHours(0);
    }
  }, [isOpen]);

  /**
   * Adjusts timesCompleted and progress values dynamically based on status transition.
   * 
   * @param status - The selected course status
   */
  const handleStatusChange = (status: 'PlanToStart' | 'Studying' | 'Completed') => {
    setCourseStatus(status);
    if (status === 'PlanToStart') {
      setCourseTimesCompleted(0);
      setCourseCurrentMinutes(0);
      setCourseCurrentHours(0);
    } else if (status === 'Completed') {
      setCourseCurrentMinutes(courseTotalMinutes);
      setCourseCurrentHours(courseTotalHours);
      if (courseTimesCompleted === 0) {
        setCourseTimesCompleted(1);
      }
    }
  };

  /**
   * Submits the new course entry to Firestore database.
   */
  const handleSave = async () => {
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
      onClose();
    } catch (err) {
      console.error('Failed to add course:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose} data-testid="add-course-modal">
      <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <CloseButton onClick={onClose}>✕</CloseButton>
        <ModalDetails style={{ padding: '30px' }}>
          <ShowHeader>
            <ShowTitle style={{ color: 'var(--accent)' }}>Adicionar Novo Curso</ShowTitle>
            <ShowYearMeta>Preencha os detalhes do curso para rastrear suas aulas e progresso</ShowYearMeta>
          </ShowHeader>

          <FormSection style={{ border: 'none', paddingTop: 0 }}>
            <InputWrapper>
              <InputLabel htmlFor="add-course-title">Título *</InputLabel>
              <SmallInput 
                type="text" 
                id="add-course-title" 
                placeholder="Digite o nome do curso"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
              />
            </InputWrapper>

            <FormRow>
              <InputWrapper>
                <InputLabel htmlFor="add-course-platform">Plataforma</InputLabel>
                <Select 
                  id="add-course-platform" 
                  value={coursePlatform} 
                  onChange={(e) => setCoursePlatform(e.target.value)}
                >
                  {COURSE_PLATFORMS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                  <option value="Other">Outra (Especificar)</option>
                </Select>
              </InputWrapper>

              {coursePlatform === 'Other' && (
                <InputWrapper>
                  <InputLabel htmlFor="add-course-custom-platform">Especificar Plataforma</InputLabel>
                  <SmallInput 
                    type="text" 
                    id="add-course-custom-platform" 
                    placeholder="Ex: Hotmart, Alura..."
                    value={courseCustomPlatform}
                    onChange={(e) => setCourseCustomPlatform(e.target.value)}
                  />
                </InputWrapper>
              )}
            </FormRow>

            <FormRow>
              <InputWrapper>
                <InputLabel htmlFor="add-course-prog-type">Medir Progresso Por</InputLabel>
                <Select 
                  id="add-course-prog-type" 
                  value={courseProgressType} 
                  onChange={(e) => setCourseProgressType(e.target.value as any)}
                >
                  <option value="minutes">Minutos Assistidos</option>
                  <option value="hours">Horas Assistidas</option>
                </Select>
              </InputWrapper>

              <InputWrapper>
                <InputLabel htmlFor="add-course-status">Status do Curso</InputLabel>
                <Select 
                  id="add-course-status" 
                  value={courseStatus} 
                  onChange={(e) => handleStatusChange(e.target.value as any)}
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
                    <InputLabel htmlFor="add-course-total-min">Total de Minutos</InputLabel>
                    <SmallInput 
                      type="number" 
                      id="add-course-total-min" 
                      min="1"
                      value={courseTotalMinutes}
                      onChange={(e) => {
                        const mins = Math.max(1, parseInt(e.target.value, 10) || 1);
                        setCourseTotalMinutes(mins);
                        if (courseStatus === 'Completed') {
                          setCourseCurrentMinutes(mins);
                        }
                      }}
                    />
                  </InputWrapper>

                  {courseStatus === 'Studying' && (
                    <InputWrapper>
                      <InputLabel htmlFor="add-course-curr-min">Minutos Concluídos</InputLabel>
                      <SmallInput 
                        type="number" 
                        id="add-course-curr-min" 
                        min="0"
                        max={courseTotalMinutes}
                        value={courseCurrentMinutes}
                        onChange={(e) => setCourseCurrentMinutes(Math.min(Math.max(0, parseInt(e.target.value, 10) || 0), courseTotalMinutes))}
                      />
                    </InputWrapper>
                  )}
                </>
              ) : (
                <>
                  <InputWrapper>
                    <InputLabel htmlFor="add-course-total-hrs">Total de Horas</InputLabel>
                    <SmallInput 
                      type="number" 
                      id="add-course-total-hrs" 
                      min="1"
                      value={courseTotalHours}
                      onChange={(e) => {
                        const hrs = Math.max(1, parseInt(e.target.value, 10) || 1);
                        setCourseTotalHours(hrs);
                        if (courseStatus === 'Completed') {
                          setCourseCurrentHours(hrs);
                        }
                      }}
                    />
                  </InputWrapper>

                  {courseStatus === 'Studying' && (
                    <InputWrapper>
                      <InputLabel htmlFor="add-course-curr-hrs">Horas Concluídas</InputLabel>
                      <SmallInput 
                        type="number" 
                        id="add-course-curr-hrs" 
                        min="0"
                        max={courseTotalHours}
                        value={courseCurrentHours}
                        onChange={(e) => setCourseCurrentHours(Math.min(Math.max(0, parseInt(e.target.value, 10) || 0), courseTotalHours))}
                      />
                    </InputWrapper>
                  )}
                </>
              )}
            </FormRow>

            <FormRow>
              {courseStatus === 'Completed' && (
                <InputWrapper>
                  <InputLabel htmlFor="add-course-times-comp">Vezes Concluído</InputLabel>
                  <SmallInput 
                    type="number" 
                    id="add-course-times-comp" 
                    min="0"
                    value={courseTimesCompleted}
                    onChange={(e) => setCourseTimesCompleted(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  />
                </InputWrapper>
              )}

              <InputWrapper>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <InputLabel>Sua Nota</InputLabel>
                  {courseRating > 0 && (
                    <button 
                      type="button" 
                      onClick={() => setCourseRating(0)}
                      style={{ background: 'none', border: 'none', color: 'var(--foreground-muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Limpar nota
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
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
                  <span style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)' }}>
                    {courseRating > 0 ? `${courseRating}/5` : 'Sem nota'}
                  </span>
                </div>
              </InputWrapper>
            </FormRow>

            <ModalActions>
              <ActionButton $variant="secondary" type="button" onClick={onClose}>
                Cancelar
              </ActionButton>
              <ActionButton $variant="primary" type="button" style={{ background: 'var(--accent)' }} onClick={handleSave} disabled={!courseTitle.trim()}>
                Adicionar Curso
              </ActionButton>
            </ModalActions>
          </FormSection>
        </ModalDetails>
      </ModalContent>
    </ModalOverlay>
  );
};
