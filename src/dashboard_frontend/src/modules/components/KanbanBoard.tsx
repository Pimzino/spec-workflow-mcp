import React, { useMemo, useCallback, useRef } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { KanbanTaskCard } from './KanbanTaskCard';
import { useTranslation } from 'react-i18next';

interface Task {
  id: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  isHeader?: boolean;
  completed?: boolean;
  files?: string[];
  implementationDetails?: string[];
  requirements?: string[];
  leverage?: string;
  prompt?: string;
}

interface KanbanBoardProps {
  tasks: Task[];
  specName: string;
  onTaskStatusChange: (taskId: string, newStatus: 'pending' | 'in-progress' | 'completed' | 'blocked') => void;
  onCopyTaskPrompt: (task: Task) => void;
  copiedTaskId: string | null;
  data: any;
  statusFilter?: 'all' | 'pending' | 'in-progress' | 'completed' | 'blocked';
}

export function KanbanBoard({
  tasks,
  specName,
  onTaskStatusChange,
  onCopyTaskPrompt,
  copiedTaskId,
  data,
  statusFilter = 'all'
}: KanbanBoardProps) {
  const { t } = useTranslation();
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);
  const scrollPositionRef = useRef({ x: 0, y: 0 });
  const [currentScrollIndex, setCurrentScrollIndex] = React.useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Light scroll management - only prevent selection during drag
  const preventSelection = useCallback(() => {
    // Only prevent text selection during drag, not scrolling
    if ('ontouchstart' in window) {
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
    }
  }, []);

  const restoreSelection = useCallback(() => {
    // Restore text selection
    if ('ontouchstart' in window) {
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    }
  }, []);

  // Setup sensors for drag and drop - industry standard configuration
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Industry standard 250ms
        tolerance: 5, // Standard tolerance for finger movement
      },
    })
  );

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const filtered = tasks.filter(task => !task.isHeader); // Exclude headers from kanban
    return {
      pending: filtered.filter(task => task.status === 'pending'),
      'in-progress': filtered.filter(task => task.status === 'in-progress'),
      blocked: filtered.filter(task => task.status === 'blocked'),
      completed: filtered.filter(task => task.status === 'completed'),
    };
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);

    // Only prevent text selection during drag, allow scrolling
    preventSelection();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    // Restore text selection
    restoreSelection();

    // Debug logging
    console.log('[KanbanBoard] Drag end event:', {
      activeId: active.id,
      overId: over?.id,
      overData: over?.data,
    });

    if (!over) {
      console.log('[KanbanBoard] No drop target detected');
      return;
    }

    const taskId = active.id as string;
    let newStatus: 'pending' | 'in-progress' | 'completed' | 'blocked' | null = null;

    // Check if we dropped directly on a status column
    if (['pending', 'in-progress', 'completed', 'blocked'].includes(over.id as string)) {
      newStatus = over.id as 'pending' | 'in-progress' | 'completed' | 'blocked';
      console.log('[KanbanBoard] Dropped on column:', newStatus);
    } else {
      // We dropped on a task - figure out which column that task is in
      const targetTask = tasks.find(t => t.id === over.id);
      if (targetTask) {
        newStatus = targetTask.status;
        console.log('[KanbanBoard] Dropped on task:', targetTask.id, 'in column:', newStatus);
      } else {
        console.log('[KanbanBoard] Could not find target task for id:', over.id);
      }
    }

    if (!newStatus) {
      console.log('[KanbanBoard] No new status determined');
      return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      console.log('[KanbanBoard] Could not find dragged task:', taskId);
      return;
    }

    if (task.status === newStatus) {
      console.log('[KanbanBoard] Task already has target status:', newStatus);
      return;
    }

    console.log('[KanbanBoard] Updating task status:', taskId, 'from', task.status, 'to', newStatus);
    onTaskStatusChange(taskId, newStatus);
  };

  const getColumnConfig = (status: 'pending' | 'in-progress' | 'completed' | 'blocked') => {
    const configs = {
      pending: {
        title: t('tasksPage.statusPill.pending', 'Pending'),
        bgColor: 'bg-[var(--surface-base)]',
        borderColor: 'border-[var(--border-default)]',
        headerBg: 'bg-[var(--surface-panel)]',
        textColor: 'text-[var(--text-secondary)]',
        dotColor: 'bg-gray-400',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      'in-progress': {
        title: t('tasksPage.statusPill.inProgress', 'In Progress'),
        bgColor: 'bg-[var(--surface-base)]',
        borderColor: 'border-[var(--border-default)]',
        headerBg: 'bg-[var(--surface-panel)]',
        textColor: 'text-[var(--text-secondary)]',
        dotColor: 'bg-orange-500',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      blocked: {
        title: t('tasksPage.statusPill.blocked', 'Blocked'),
        bgColor: 'bg-[var(--surface-base)]',
        borderColor: 'border-[var(--border-default)]',
        headerBg: 'bg-[var(--surface-panel)]',
        textColor: 'text-[var(--text-secondary)]',
        dotColor: 'bg-red-500',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        ),
      },
      completed: {
        title: t('tasksPage.statusPill.completed', 'Completed'),
        bgColor: 'bg-[var(--surface-base)]',
        borderColor: 'border-[var(--border-default)]',
        headerBg: 'bg-[var(--surface-panel)]',
        textColor: 'text-[var(--text-secondary)]',
        dotColor: 'bg-green-500',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
    };
    return configs[status];
  };

  // Droppable Column Component
  const DroppableColumn = ({ status }: { status: 'pending' | 'in-progress' | 'completed' | 'blocked' }) => {
    const config = getColumnConfig(status);
    const columnTasks = tasksByStatus[status];

    const {
      isOver,
      setNodeRef,
    } = useDroppable({
      id: status,
      data: {
        type: 'column',
        status: status,
      },
    });

    return (
      <div
        ref={setNodeRef}
        key={status}
        className={`
          w-72 snap-center flex-shrink-0 rounded-md border flex flex-col
          sm:w-80 md:w-80
          lg:flex-1 lg:min-w-80
          ${config.borderColor} ${config.bgColor}
          ${isOver ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
        `}
      >
        {/* Column Header */}
        <div className={`px-4 py-3 rounded-t-md ${config.headerBg} border-b ${config.borderColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {status === 'blocked' ? (
                <svg className="w-2 h-2 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              ) : (
                <div className={`w-2 h-2 rounded-full ${config.dotColor}`} />
              )}
              <h3 className={`text-sm font-medium ${config.textColor}`}>
                {config.title}
              </h3>
            </div>
            <span className={`text-sm ${config.textColor} bg-[var(--surface-base)] px-2 py-1 rounded-md`}>
              {columnTasks.length}
            </span>
          </div>
        </div>

        {/* Drop Zone */}
        <SortableContext
          id={`${status}-sortable`}
          items={columnTasks.map(task => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            className={`
              flex-1 p-2 sm:p-3 space-y-2 transition-all duration-200
              max-h-[70vh] overflow-y-auto
              ${/* Enhanced mobile drop zone feedback */ ''}
              ${isOver
                ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-400 ring-opacity-75 scale-[1.02]'
                : ''
              }
            `}
            style={{
              touchAction: 'pan-y', /* Allow vertical scrolling within columns */
            }}
          >
            {columnTasks.length === 0 ? (
              <div className="flex items-center justify-center min-h-[120px] text-center py-4 text-gray-400 dark:text-gray-500">
                <div className="text-xs">
                  {status === 'pending' && t('tasksPage.kanban.noPendingTasks', 'No pending tasks')}
                  {status === 'in-progress' && t('tasksPage.kanban.noInProgressTasks', 'No tasks in progress')}
                  {status === 'blocked' && t('tasksPage.kanban.noBlockedTasks', 'No blocked tasks')}
                  {status === 'completed' && t('tasksPage.kanban.noCompletedTasks', 'No completed tasks')}
                </div>
              </div>
            ) : (
              columnTasks.map((task) => (
                <KanbanTaskCard
                  key={task.id}
                  task={task}
                  specName={specName}
                  onCopyTaskPrompt={() => onCopyTaskPrompt(task)}
                  copiedTaskId={copiedTaskId}
                  isInProgress={data?.inProgress === task.id}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    );
  };

  const renderColumn = (status: 'pending' | 'in-progress' | 'completed' | 'blocked') => {
    return <DroppableColumn key={status} status={status} />;
  };

  // Determine which columns to show based on status filter
  const columnsToShow = useMemo(() => {
    if (statusFilter === 'all') {
      return ['pending', 'in-progress', 'blocked', 'completed'] as const;
    } else {
      return [statusFilter] as const;
    }
  }, [statusFilter]);

  // Scroll tracking for indicators (mobile only)
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current && columnsToShow.length > 1) {
      const container = scrollContainerRef.current;

      // Only track scroll on mobile/tablet where dots are visible
      if (window.innerWidth >= 1024) return; // lg breakpoint

      const scrollLeft = container.scrollLeft;
      const containerWidth = container.clientWidth;

      // Calculate actual column positions accounting for padding and gaps (mobile layout)
      const paddingLeft = 16; // pl-4 = 16px
      const columnWidth = 288; // w-72 = 288px
      const gap = 12; // gap-3 = 12px (md:gap-4 = 16px but we'll use base)

      // Calculate which column is most visible in the viewport
      let bestIndex = 0;
      let bestVisibility = 0;

      for (let i = 0; i < columnsToShow.length; i++) {
        const columnStart = paddingLeft + i * (columnWidth + gap);
        const columnEnd = columnStart + columnWidth;

        // Calculate how much of this column is visible
        const visibleStart = Math.max(columnStart, scrollLeft);
        const visibleEnd = Math.min(columnEnd, scrollLeft + containerWidth);
        const visibleWidth = Math.max(0, visibleEnd - visibleStart);
        const visibility = visibleWidth / columnWidth;

        if (visibility > bestVisibility) {
          bestVisibility = visibility;
          bestIndex = i;
        }
      }

      setCurrentScrollIndex(bestIndex);
    }
  }, [columnsToShow.length]);

  // Add scroll event listener
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return (
    <div className="w-full max-w-full overflow-hidden">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => {
          setActiveTask(null);
          restoreSelection();
        }}
      >
        {/* Kanban Board Container - Isolated Horizontal Scroll */}
        <div
          className="w-full max-w-full overflow-hidden"
          style={{
            touchAction: 'pan-x pan-y', /* Allow both horizontal and vertical scrolling */
          }}
        >
          <div
            ref={scrollContainerRef}
            className={`
              flex overflow-x-auto scroll-smooth snap-x snap-mandatory
              pl-4 pr-16 gap-3 pb-2 relative
              md:gap-4
              lg:overflow-x-visible lg:snap-none lg:px-6 lg:gap-2 lg:pb-0
              lg:justify-start
            `}
            style={{
              scrollbarWidth: 'none', /* Firefox */
              msOverflowStyle: 'none', /* IE and Edge */
              WebkitOverflowScrolling: 'touch', /* iOS momentum scrolling */
              touchAction: 'pan-x', /* Horizontal scroll only for this container */
            }}
          >
            {columnsToShow.map(status => renderColumn(status))}
          </div>
        </div>

        {/* Mobile Scroll Indicators */}
        {columnsToShow.length > 1 && (
          <div className="flex justify-center mt-4 lg:hidden">
            <div className="flex space-x-2">
              {columnsToShow.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (scrollContainerRef.current) {
                      const container = scrollContainerRef.current;

                      // Calculate actual column position accounting for padding and gaps
                      const paddingLeft = 16; // pl-4 = 16px
                      const columnWidth = 288; // w-72 = 288px
                      const gap = 12; // gap-3 = 12px
                      const targetPosition = paddingLeft + index * (columnWidth + gap);

                      container.scrollTo({
                        left: targetPosition,
                        behavior: 'smooth'
                      });
                    }
                  }}
                  className={`
                    w-2 h-2 rounded-full transition-colors duration-200
                    ${index === currentScrollIndex
                      ? 'bg-blue-500 dark:bg-blue-400'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                    }
                  `}
                  style={{ touchAction: 'manipulation' }}
                  aria-label={`Go to ${columnsToShow[index]} column`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Drag Overlay */}
        <DragOverlay
          style={{
            zIndex: 9999,
          }}
        >
          {activeTask ? (
            <div
              className="rotate-2 opacity-95 transform scale-105 pointer-events-none"
              style={{
                cursor: 'grabbing',
              }}
            >
              <KanbanTaskCard
                task={activeTask}
                specName={specName}
                onCopyTaskPrompt={() => {}}
                copiedTaskId={null}
                isInProgress={data?.inProgress === activeTask.id}
                isDragging={true}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}