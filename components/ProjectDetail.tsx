import React, { useState, useMemo, useCallback } from 'react';
import { Project, User, Log, ProjectStatus, Task, TaskStatus, UserRole, Comment } from '../types';
import { SparklesIcon, ArrowLeftIcon, PlusIcon, CalendarIcon, ExclamationIcon, PencilAltIcon, TrashIcon, ChatAltIcon } from './icons';
import { summarizeLogs } from '../services/geminiService';
import CreateTaskModal from './CreateTaskModal';
import TaskDetailModal from './TaskDetailModal';

type ProjectDetailProps = {
  project: Project;
  projects: Project[];
  users: User[];
  logs: Log[];
  tasks: Task[];
  comments: Comment[];
  currentUser: User;
  onBack: () => void;
  onTaskMove: (draggedTaskId: string, targetTaskId: string | null, newStatus: TaskStatus) => void;
  onTaskCreate: (taskData: Omit<Task, 'id' | 'status'>) => void;
  onProjectUpdate: (project: Project) => void;
  onProjectDelete: (projectId: string) => void;
  onTaskDelete: (taskId: string) => void;
  onCommentAdd: (taskId: string, text: string) => void;
};

// Enhanced TaskCard component with more visual cues for due dates
const TaskCard: React.FC<{
    task: Task,
    user?: User,
    commentsCount: number,
    onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void,
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void,
    onClick: (task: Task) => void,
    isDragging: boolean,
    isOverdue: boolean,
    isDueSoon: boolean,
    onDelete: (task: Task) => void,
    canDelete: boolean,
}> = ({ task, user, commentsCount, onDragStart, onDragEnd, onClick, isDragging, isOverdue, isDueSoon, onDelete, canDelete }) => {
    
    const getDueDateInfo = () => {
        if (isOverdue) {
            return {
                icon: <ExclamationIcon className="w-4 h-4 mr-1.5 text-red-500" />,
                textClass: 'text-red-600 font-semibold',
            };
        }
        if (isDueSoon) {
            return {
                icon: <CalendarIcon className="w-4 h-4 mr-1.5 text-yellow-600" />,
                textClass: 'text-yellow-700 font-medium',
            };
        }
        return {
            icon: <CalendarIcon className="w-4 h-4 mr-1.5 text-neutral-400" />,
            textClass: 'text-neutral-500',
        };
    };
    
    const dueDateInfo = getDueDateInfo();

    const getBorderClass = () => {
        if (isOverdue) return 'border-l-4 border-red-400';
        if (isDueSoon) return 'border-l-4 border-yellow-400';
        return 'border-l-4 border-transparent';
    };

    return (
        <div 
            draggable={true}
            onDragStart={(e) => onDragStart(e, task.id)}
            onDragEnd={onDragEnd}
            onClick={() => onClick(task)}
            data-task-id={task.id}
            className={`bg-white p-3 rounded-lg shadow-sm border border-neutral-200 mb-3 cursor-pointer active:cursor-grabbing transition-all duration-200 hover:shadow-md hover:border-brand-primary ${getBorderClass()} ${isDragging ? 'opacity-50 scale-95' : ''}`}
        >
            <div className="flex justify-between items-start">
                <p className="text-sm font-semibold text-neutral-800 pr-2 flex-grow">{task.title}</p>
                {canDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(task);
                        }}
                        className="p-1 -mr-2 -mt-1 text-neutral-400 hover:text-red-600 transition-colors flex-shrink-0"
                        title="Delete task"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                )}
            </div>
            <div className="flex justify-between items-center mt-3">
                <div className={`flex items-center text-xs ${dueDateInfo.textClass}`}>
                    {dueDateInfo.icon}
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-3">
                    {commentsCount > 0 && (
                        <div className="flex items-center text-xs text-neutral-500">
                            <ChatAltIcon className="w-4 h-4 mr-1" />
                            <span>{commentsCount}</span>
                        </div>
                    )}
                    {user && <img src={user.avatar} alt={user.name} title={user.name} className="w-7 h-7 rounded-full border-2 border-white" />}
                </div>
            </div>
        </div>
    )
};

const BoardColumn = ({ title, status, tasks, users, currentUser, comments, isDraggedOver, onDrop, onDragOver, onDragEnter, onDragLeave, onTaskDragStart, onTaskDragEnd, draggedTaskId, onTaskClick, onTaskDelete }: { 
    title: string, 
    status: TaskStatus, 
    tasks: Task[], 
    users: User[], 
    currentUser: User,
    comments: Comment[],
    isDraggedOver: boolean,
    onDrop: (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => void, 
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void,
    onDragEnter: (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => void,
    onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void,
    onTaskDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void,
    onTaskDragEnd: (e: React.DragEvent<HTMLDivElement>) => void,
    onTaskClick: (task: Task) => void,
    onTaskDelete: (task: Task) => void,
    draggedTaskId: string | null
}) => {
    const colors = {
      [TaskStatus.ToDo]: "bg-gray-200 text-gray-800",
      [TaskStatus.InProgress]: "bg-blue-100 text-blue-800",
      [TaskStatus.Review]: "bg-yellow-100 text-yellow-800",
      [TaskStatus.Done]: "bg-green-100 text-green-800",
    }
    
    const sortedTasks = useMemo(() => tasks.sort((a, b) => a.order - b.order), [tasks]);

    return (
        <div 
            className={`rounded-lg w-72 md:w-80 p-2 flex-shrink-0 transition-colors duration-200 ${isDraggedOver ? 'bg-brand-light' : 'bg-neutral-50'}`}
            onDrop={(e) => onDrop(e, status)}
            onDragOver={onDragOver}
            onDragEnter={(e) => onDragEnter(e, status)}
            onDragLeave={onDragLeave}
        >
            <div className="flex justify-between items-center p-2 mb-2">
              <h3 className={`font-semibold text-sm px-2 py-0.5 rounded-md ${colors[status]}`}>{title}</h3>
              <span className="text-sm font-bold text-neutral-500">{tasks.length}</span>
            </div>
            <div className="min-h-[200px] h-full overflow-y-auto pr-1">
              {sortedTasks.map(task => {
                  const user = users.find(u => u.id === task.assigneeId);
                  const commentsCount = comments.filter(c => c.taskId === task.id).length;
                  
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  
                  // Parsing date string as local date to avoid timezone issues with `new Date()`
                  const [year, month, day] = task.dueDate.split('-').map(Number);
                  const dueDate = new Date(year, month - 1, day);
                  
                  const isOverdue = today > dueDate && task.status !== TaskStatus.Done;

                  const diffTime = dueDate.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  // "within the next 3 days" is interpreted as today, tomorrow, or the day after.
                  const isDueSoon = diffDays >= 0 && diffDays <= 2 && !isOverdue && task.status !== TaskStatus.Done;

                  return <TaskCard 
                            key={task.id} 
                            task={task} 
                            user={user} 
                            commentsCount={commentsCount}
                            onDragStart={onTaskDragStart} 
                            onDragEnd={onTaskDragEnd}
                            onClick={onTaskClick}
                            isDragging={draggedTaskId === task.id} 
                            isOverdue={isOverdue}
                            isDueSoon={isDueSoon}
                            onDelete={onTaskDelete}
                            canDelete={currentUser.role === UserRole.Manager}
                         />
              })}
            </div>
        </div>
    );
};

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, projects, users, logs, tasks, comments, currentUser, onBack, onTaskMove, onTaskCreate, onProjectUpdate, onProjectDelete, onTaskDelete, onCommentAdd }) => {
  const [aiSummary, setAiSummary] = useState('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);


  const projectTasks = useMemo(() => tasks.filter(task => task.projectId === project.id), [tasks, project.id]);
  const projectLogs = useMemo(() => logs.filter(log => log.projectId === project.id), [logs, project.id]);
  
  const handleGenerateSummary = useCallback(async () => {
    if (projectLogs.length === 0) {
      setAiSummary("No logs available to generate a summary.");
      return;
    }
    setIsLoadingSummary(true);
    setError('');
    setAiSummary('');
    try {
      const summary = await summarizeLogs(projectLogs, users, project.name);
      setAiSummary(summary);
    } catch (err)
 {
      setError('Failed to generate summary. Please try again.');
      console.error(err);
    } finally {
      setIsLoadingSummary(false);
    }
  }, [projectLogs, users, project.name]);

  const handleDeleteProject = () => {
    if (window.confirm(`Are you sure you want to delete the project "${project.name}"? This action cannot be undone.`)) {
        onProjectDelete(project.id);
    }
  };

  const handleTaskDeleteConfirm = (task: Task) => {
    if (window.confirm(`Are you sure you want to delete the task "${task.title}"? This action cannot be undone.`)) {
        onTaskDelete(task.id);
    }
  };

  const getDropTargetTaskId = (e: React.DragEvent<HTMLDivElement>): string | null => {
      const columnElement = e.currentTarget;
      const taskCards = Array.from(columnElement.querySelectorAll('[data-task-id]')) as HTMLElement[];
      
      const closest = taskCards.reduce((closest, child) => {
          const box = child.getBoundingClientRect();
          const offset = e.clientY - box.top - box.height / 2;
          if (offset < 0 && offset > closest.offset) {
              return { offset: offset, element: child };
          } else {
              return closest;
          }
      }, { offset: Number.NEGATIVE_INFINITY, element: null as HTMLElement | null });
      
      return closest.element ? closest.element.dataset.taskId || null : null;
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: TaskStatus) => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData("taskId");
      if (taskId) {
        const targetTaskId = getDropTargetTaskId(e);
        onTaskMove(taskId, targetTaskId, newStatus);
      }
      setDragOverStatus(null);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverStatus(null);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
    e.preventDefault();
    setDragOverStatus(status);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };


  return (
    <div className="p-4 sm:p-8 h-full flex flex-col animate-fade-in">
       <div className="flex-shrink-0">
        <button onClick={onBack} className="flex items-center text-sm font-medium text-brand-primary hover:underline mb-6">
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Projects
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
            <div className="mb-4 md:mb-0">
              <h2 className="text-3xl font-bold text-neutral-800">{project.name}</h2>
              <p className="text-neutral-500 mt-1 max-w-2xl">{project.description}</p>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
                <button onClick={handleGenerateSummary} disabled={isLoadingSummary} className="flex items-center bg-white border border-neutral-300 text-neutral-700 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-neutral-50 disabled:bg-neutral-200 transition-colors">
                  <SparklesIcon className="w-5 h-5 mr-2 text-brand-primary"/>
                  {isLoadingSummary ? 'Generating...' : 'AI Summary'}
                </button>
                 {currentUser.role !== UserRole.Executive && (
                    <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center bg-brand-accent text-brand-primary px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-transform duration-200 hover:scale-105">
                        <PlusIcon className="w-5 h-5 mr-1.5"/>
                        Add Task
                    </button>
                 )}
                 {currentUser.role === UserRole.Manager && (
                    <>
                        <button onClick={() => {}} className="p-2 rounded-lg text-neutral-600 bg-white border border-neutral-300 hover:bg-neutral-100 transition-colors">
                            <PencilAltIcon className="w-5 h-5"/>
                        </button>
                        <button onClick={handleDeleteProject} className="p-2 rounded-lg text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors">
                            <TrashIcon className="w-5 h-5"/>
                        </button>
                    </>
                 )}
            </div>
        </div>

        {error && <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert"><p>{error}</p></div>}
        {aiSummary && <div className="mb-4 bg-brand-light bg-opacity-30 border-l-4 border-brand-accent text-neutral-800 p-4 rounded-md whitespace-pre-wrap font-mono text-sm animate-fade-in">{aiSummary}</div>}
       </div>
      
       <div className="flex-grow flex space-x-4 overflow-x-auto pb-4">
            <BoardColumn 
                title="To Do" 
                status={TaskStatus.ToDo} 
                tasks={projectTasks.filter(t => t.status === TaskStatus.ToDo)} 
                users={users} 
                currentUser={currentUser}
                comments={comments}
                isDraggedOver={dragOverStatus === TaskStatus.ToDo}
                onDrop={onDrop} 
                onDragOver={onDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onTaskDragStart={handleDragStart}
                onTaskDragEnd={handleDragEnd}
                onTaskClick={setSelectedTask}
                onTaskDelete={handleTaskDeleteConfirm}
                draggedTaskId={draggedTaskId}
            />
            <BoardColumn 
                title="In Progress" 
                status={TaskStatus.InProgress} 
                tasks={projectTasks.filter(t => t.status === TaskStatus.InProgress)} 
                users={users} 
                currentUser={currentUser}
                comments={comments}
                isDraggedOver={dragOverStatus === TaskStatus.InProgress}
                onDrop={onDrop} 
                onDragOver={onDragOver} 
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onTaskDragStart={handleDragStart}
                onTaskDragEnd={handleDragEnd}
                onTaskClick={setSelectedTask}
                onTaskDelete={handleTaskDeleteConfirm}
                draggedTaskId={draggedTaskId}
            />
            <BoardColumn 
                title="Review" 
                status={TaskStatus.Review} 
                tasks={projectTasks.filter(t => t.status === TaskStatus.Review)} 
                users={users} 
                currentUser={currentUser}
                comments={comments}
                isDraggedOver={dragOverStatus === TaskStatus.Review}
                onDrop={onDrop} 
                onDragOver={onDragOver} 
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onTaskDragStart={handleDragStart}
                onTaskDragEnd={handleDragEnd}
                onTaskClick={setSelectedTask}
                onTaskDelete={handleTaskDeleteConfirm}
                draggedTaskId={draggedTaskId}
            />
            <BoardColumn 
                title="Done" 
                status={TaskStatus.Done} 
                tasks={projectTasks.filter(t => t.status === TaskStatus.Done)} 
                users={users} 
                currentUser={currentUser}
                comments={comments}
                isDraggedOver={dragOverStatus === TaskStatus.Done}
                onDrop={onDrop} 
                onDragOver={onDragOver} 
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onTaskDragStart={handleDragStart}
                onTaskDragEnd={handleDragEnd}
                onTaskClick={setSelectedTask}
                onTaskDelete={handleTaskDeleteConfirm}
                draggedTaskId={draggedTaskId}
            />
       </div>
       {currentUser.role !== UserRole.Executive && (
        <CreateTaskModal 
            show={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={onTaskCreate}
            projects={projects}
            users={users}
            defaultProjectId={project.id}
        />
       )}
       {selectedTask && (
        <TaskDetailModal
            show={!!selectedTask}
            onClose={() => setSelectedTask(null)}
            task={selectedTask}
            project={project}
            comments={comments.filter(c => c.taskId === selectedTask.id).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())}
            users={users}
            currentUser={currentUser}
            onAddComment={onCommentAdd}
        />
       )}
    </div>
  );
};

export default ProjectDetail;