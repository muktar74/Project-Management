import React, { useState, useMemo } from 'react';
import { Task, Project, Comment, User, TaskStatus } from '../types';
import { CloseIcon, CalendarIcon } from './icons';

type TaskDetailModalProps = {
  show: boolean;
  onClose: () => void;
  task: Task;
  project: Project;
  comments: Comment[];
  users: User[];
  currentUser: User;
  onAddComment: (taskId: string, text: string) => void;
};

const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 1) return `${days} days ago`;
    if (days === 1) return `1 day ago`;
    if (hours > 1) return `${hours} hours ago`;
    if (hours === 1) return `1 hour ago`;
    if (minutes > 1) return `${minutes} minutes ago`;
    if (minutes <= 1) return `a minute ago`;
    return 'just now';
};


const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ show, onClose, task, project, comments, users, currentUser, onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  
  const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
  const assignee = useMemo(() => userMap.get(task.assigneeId), [task.assigneeId, userMap]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(task.id, newComment.trim());
      setNewComment('');
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
            </div>
        </header>

        <div className="p-6 flex-grow overflow-y-auto">
            {task.description && (
                <div className="mb-6">
                    <h3 className="font-semibold text-neutral-700 mb-2">Description</h3>
                    <p className="text-neutral-600 whitespace-pre-wrap">{task.description}</p>
                </div>
            )}
            
            <div>
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