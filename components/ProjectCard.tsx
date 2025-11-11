import React from 'react';
import { Project, User, ProjectStatus, Task, TaskStatus, UserRole } from '../types.ts';
import { CheckSquareIcon, PencilAltIcon } from './icons.tsx';

type ProjectCardProps = {
  project: Project;
  users: User[];
  tasks: Task[];
  currentUser: User;
  onProjectSelect: (id: string) => void;
  onEdit: (project: Project) => void;
};

const getStatusColor = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.OnTrack: return 'bg-green-100 text-green-800';
    case ProjectStatus.AtRisk: return 'bg-yellow-100 text-yellow-800';
    case ProjectStatus.OffTrack: return 'bg-red-100 text-red-800';
    case ProjectStatus.OnHold: return 'bg-gray-100 text-gray-800';
    case ProjectStatus.Completed: return 'bg-brand-light text-brand-primary';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getProgressBarColor = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.OnTrack: return 'bg-brand-accent';
    case ProjectStatus.AtRisk: return 'bg-yellow-500';
    case ProjectStatus.OffTrack: return 'bg-red-500';
    case ProjectStatus.OnHold: return 'bg-gray-500';
    case ProjectStatus.Completed: return 'bg-brand-accent';
    default: return 'bg-gray-500';
  }
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project, users, tasks, currentUser, onProjectSelect, onEdit }) => {
  const teamMembers = users.filter(user => project.team.includes(user.id));
  const openTasks = tasks.filter(task => task.projectId === project.id && task.status !== TaskStatus.Done).length;

  return (
    <div onClick={() => onProjectSelect(project.id)} className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-neutral-800 mb-2">{project.name}</h3>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>
        <p className="text-sm text-neutral-600 line-clamp-2">{project.description}</p>
      </div>
      <div className="mt-6">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-neutral-500">Progress</span>
          <span className="text-sm font-bold text-brand-primary">{project.progress}%</span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${getProgressBarColor(project.status)}`}
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
        <div className="border-t border-neutral-100 mt-4 pt-4 flex justify-between items-center">
          <div className="flex -space-x-2">
            {teamMembers.slice(0, 4).map(member => (
              <img
                key={member.id}
                src={member.avatar}
                alt={member.name}
                title={member.name}
                className="w-8 h-8 rounded-full border-2 border-white"
              />
            ))}
            {teamMembers.length > 4 && (
              <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-semibold text-neutral-600 border-2 border-white">
                +{teamMembers.length - 4}
              </div>
            )}
          </div>
           <div className="flex items-center space-x-3">
             <div className="flex items-center text-xs text-neutral-500">
               <CheckSquareIcon className="w-4 h-4 mr-1.5 text-neutral-400" />
               <span className="font-semibold">{openTasks}</span>&nbsp;open tasks
             </div>
             {currentUser.role === UserRole.Manager && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(project);
                  }}
                  className="p-1.5 rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-brand-primary transition-colors"
                  title="Edit project"
                >
                  <PencilAltIcon className="w-4 h-4" />
                </button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;