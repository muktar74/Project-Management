import React from 'react';
import { Project, User, Task, UserRole } from '../types.ts';
import ProjectCard from './ProjectCard.tsx';
import { PlusIcon } from './icons.tsx';

type ProjectsViewProps = {
    projects: Project[];
    users: User[];
    tasks: Task[];
    currentUser: User;
    onProjectSelect: (id: string) => void;
    onOpenCreateModal: () => void;
    onOpenEditModal: (project: Project) => void;
};

const ProjectsView: React.FC<ProjectsViewProps> = ({ projects, users, tasks, currentUser, onProjectSelect, onOpenCreateModal, onOpenEditModal }) => {
    return (
        <div className="p-8 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-neutral-800">Projects</h2>
                {currentUser.role === UserRole.Manager && (
                    <button 
                        onClick={onOpenCreateModal}
                        className="flex items-center bg-brand-accent text-brand-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-transform duration-200 hover:scale-105"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Create Project
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map(project => (
                    <ProjectCard 
                        key={project.id} 
                        project={project} 
                        users={users} 
                        tasks={tasks} 
                        currentUser={currentUser}
                        onProjectSelect={onProjectSelect}
                        onEdit={onOpenEditModal}
                    />
                ))}
            </div>
        </div>
    );
};

export default ProjectsView;