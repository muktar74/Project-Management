import React, { useState, useMemo } from 'react';
import { Task, Project, Comment, User, TaskStatus, ReminderType, TaskPriority } from '../types';
import { CloseIcon, CalendarIcon, BellIcon } from './icons';
import { formatRelativeTime } from '../utils/helpers';

type TaskDetailModalProps = {
  show: boolean;
  onClose: () => void;
  task: Task;
  project: Project;
  comments: Comment[];
  users: User[];
  currentUser: User;
  onAddComment: (taskId: string, text: string) => void;
  allTasksInProject: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Omit<Task, 'id'>>) => void;
};

const reminderOptions: { value: ReminderType | 'none'; label: string }[] = [
    { value: 'none', label: 'No Reminder' },
    { value: 'on_due_date', label: 'At time of due date' },
    { value: '1_hour_before', label: '1 hour before' },
    { value: '2_hours_before', label: '2 hours before' },
    { value: '1_day_before', label: '1 day before' },
    { value: '2_days_before', label: '2 days before' },
];

const getReminderText = (reminder: ReminderType | undefined) => {
    if (!reminder) return 'No reminder set.';
    const option = reminderOptions.find(opt => opt.value === reminder);
    return `Reminder set for: ${option?.label.toLowerCase()}`;
};


const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ show, onClose, task, project, comments, users, currentUser, onAddComment, allTasksInProject, onUpdateTask }) => {
  const [newComment, setNewComment] = useState('');
  
  const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
  const taskMap = useMemo(() => new Map(allTasksInProject.map(t => [t.id, t])), [allTasksInProject]);

  const assignee = useMemo(() => userMap.get(task.assigneeId), [task.assigneeId, userMap]);

  const possibleDependencies = useMemo(() => {
    return allTasksInProject.filter(t => 
        t.id !== task.id && !task.dependencies.includes(t.id)
    );
  }, [allTasksInProject, task.id, task.dependencies]);

  const blockedTasks = useMemo(() => {
      return allTasksInProject.filter(t => t.dependencies.includes(task.id));
  }, [allTasksInProject, task.id]);
  
  const isCircular = (taskIdToAdd: string): boolean => {
      const queue: string[] = [task.id];
      const visited = new Set<string>([task.id]);

      while(queue.length > 0){
          const currentId = queue.shift()!;
          const tasksBlockedByCurrent = allTasksInProject.filter(t => t.dependencies.includes(currentId));

          for (const blockedTask of tasksBlockedByCurrent) {
              if (blockedTask.id === taskIdToAdd) return true;
              if (!visited.has(blockedTask.id)) {
                  visited.add(blockedTask.id);
                  queue.push(blockedTask.id);
              }
          }
      }
      return false;
  };

  const handleAddDependency = (depId: string) => {
      if (!depId) return;
      if (isCircular(depId)) {
          alert("Adding this task would create a circular dependency.");
          return;
      }
      const newDeps = [...task.dependencies, depId];
      onUpdateTask(task.id, { dependencies: newDeps });
  };

  const handleRemoveDependency = (depId: string) => {
      const newDeps = task.dependencies.filter(id => id !== depId);
      onUpdateTask(task.id, { dependencies: newDeps });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(task.id, newComment.trim());
      setNewComment('');
    }
  };
  
  const handleReminderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'none') {
        const { reminder, ...taskWithoutReminder } = task;
        onUpdateTask(task.id, { ...taskWithoutReminder, reminder: undefined });
    } else {
        onUpdateTask(task.id, { reminder: value as ReminderType });
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="p-6 border-b border-neutral-200 flex-shrink-0">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800">{task.title}</h2>
                    <p className="text-sm text-neutral-500">
                        in project <span className="font-semibold text-brand-primary">{project.name}</span>
                    </p>
                </div>
                <button onClick={onClose} className="p-2 -mt-2 -mr-2 text-neutral-500 hover:text-neutral-800">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="flex items-center space-x-6 mt-4 text-sm">
                <div className="flex items-center">
                    <span className="text-neutral-500 mr-2">Assignee:</span>
                    {assignee ? (
                         <div className="flex items-center">
                            <img src={assignee.avatar} alt={assignee.name} className="w-6 h-6 rounded-full mr-2"/>
                            <span className="font-semibold text-neutral-700">{assignee.name}</span>
                        </div>
                    ) : <span className="text-neutral-600">Unassigned</span>}
                </div>
                <div className="flex items-center text-neutral-600">
                     <CalendarIcon className="w-5 h-5 mr-1.5 text-neutral-400" />
                     <span className="font-semibold">{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                    <span className="text-neutral-500 mr-2">Priority:</span>
                    <select
                        value={task.priority || TaskPriority.Medium}
                        onChange={(e) => onUpdateTask(task.id, { priority: e.target.value as TaskPriority })}
                        className="block w-full max-w-xs bg-white border border-neutral-300 rounded-md py-1 px-2 text-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                    >
                        {Object.values(TaskPriority).map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>
            </div>
        </header>

        <div className="p-6 flex-grow overflow-y-auto">
            {task.description && (
                <div className="mb-6">
                    <h3 className="font-semibold text-neutral-700 mb-2">Description</h3>
                    <p className="text-neutral-600 whitespace-pre-wrap">{task.description}</p>
                </div>
            )}

            <div className="mb-6">
                <h3 className="font-semibold text-neutral-700 mb-2">Reminder</h3>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center p-3 bg-neutral-50 rounded-lg flex-grow">
                        <BellIcon className="w-5 h-5 text-neutral-500 mr-3 flex-shrink-0" />
                        <span className="text-sm text-neutral-700">{getReminderText(task.reminder)}</span>
                    </div>
                    <select
                        value={task.reminder || 'none'}
                        onChange={handleReminderChange}
                        className="block px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
                    >
                        {reminderOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="border-t border-neutral-200 mt-6 pt-6">
                <h3 className="font-semibold text-neutral-700 mb-4">Task Dependencies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-medium text-neutral-600 mb-2 block">Depends On (Prerequisites)</label>
                        <div className="space-y-2 mb-3">
                            {task.dependencies.map(depId => {
                                const depTask = taskMap.get(depId);
                                return (
                                    <div key={depId} className="flex items-center justify-between bg-neutral-100 p-2 rounded-md text-sm">
                                        <span className="truncate pr-2">{depTask?.title || 'Unknown Task'}</span>
                                        <button onClick={() => handleRemoveDependency(depId)} className="p-1 text-neutral-500 hover:text-red-600 flex-shrink-0">
                                            <CloseIcon className="w-4 h-4"/>
                                        </button>
                                    </div>
                                );
                            })}
                            {task.dependencies.length === 0 && <p className="text-xs text-neutral-500 italic px-2">This task has no prerequisites.</p>}
                        </div>
                        <select
                            onChange={(e) => handleAddDependency(e.target.value)}
                            value=""
                            className="block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
                        >
                            <option value="" disabled>Add a prerequisite...</option>
                            {possibleDependencies.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-neutral-600 mb-2 block">Blocks (Subsequent Tasks)</label>
                        <div className="space-y-2">
                            {blockedTasks.map(blockedTask => (
                                <div key={blockedTask.id} className="bg-neutral-100 p-2 rounded-md text-sm truncate">
                                    <span>{blockedTask.title}</span>
                                </div>
                            ))}
                            {blockedTasks.length === 0 && <p className="text-xs text-neutral-500 italic px-2">This task is not blocking others.</p>}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-6 border-t pt-6">
                <h3 className="font-semibold text-neutral-700 mb-4">Activity</h3>
                <div className="space-y-4">
                    {comments.map(comment => {
                        const user = userMap.get(comment.userId);
                        return (
                            <div key={comment.id} className="flex items-start space-x-3">
                                <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full flex-shrink-0 mt-1" />
                                <div className="flex-1 bg-neutral-50 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-sm text-neutral-800">{user?.name}</span>
                                        <span className="text-xs text-neutral-400">{formatRelativeTime(comment.timestamp)}</span>
                                    </div>
                                    <p className="text-sm text-neutral-700 mt-1">{comment.text}</p>
                                </div>
                            </div>
                        )
                    })}
                     {comments.length === 0 && <p className="text-sm text-neutral-500 text-center py-4">No comments yet. Start the conversation!</p>}
                </div>
            </div>
        </div>

        <footer className="p-4 bg-neutral-50 border-t border-neutral-200 flex-shrink-0">
            <form onSubmit={handleCommentSubmit} className="flex items-start space-x-3">
                <img src={currentUser.avatar} alt={currentUser.name} className="w-9 h-9 rounded-full flex-shrink-0" />
                <div className="flex-1">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        rows={2}
                        className="block w-full text-sm px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent resize-none"
                    ></textarea>
                    <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="mt-2 px-4 py-1.5 text-sm font-medium text-brand-primary bg-brand-accent border border-transparent rounded-md shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed"
                    >
                        Post Comment
                    </button>
                </div>
            </form>
        </footer>
      </div>
    </div>
  );
};

export default TaskDetailModal;
