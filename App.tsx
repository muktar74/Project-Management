import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectDetail from './components/ProjectDetail';
import MyTasksView from './components/MyTasksView';
import ReportingView from './components/ReportingView';
import DailyLogsView from './components/DailyLogsView';
import LogSubmissionModal from './components/LogSubmissionModal';
import Footer from './components/Footer';
import ProjectsView from './components/ProjectsView';
import ProjectModal from './components/ProjectModal';
import { USERS, PROJECTS, LOGS, TASKS, COMMENTS } from './data';
import { User, Project, Log, UserRole, Task, TaskStatus, Comment } from './types';

type AppProps = {
  currentUser: User;
  onLogout: () => void;
};

const App: React.FC<AppProps> = ({ currentUser, onLogout }) => {
  const [users] = useState<User[]>(USERS);
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [logs, setLogs] = useState<Log[]>(LOGS);
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [comments, setComments] = useState<Comment[]>(COMMENTS);
  
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);


  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) || null;
  }, [selectedProjectId, projects]);
  
  const userProjects = useMemo(() => {
    return projects.filter(p => p.team.includes(currentUser.id) && p.status !== 'Completed');
  }, [projects, currentUser]);

  const handleProjectSelect = (id: string) => {
    setSelectedProjectId(id);
    setCurrentPage('projects');
  };
  
  const handleOpenCreateProjectModal = () => {
    setProjectToEdit(null);
    setIsProjectModalOpen(true);
  };
  
  const handleOpenEditProjectModal = (project: Project) => {
    setProjectToEdit(project);
    setIsProjectModalOpen(true);
  };

  const handleProjectDelete = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setTasks(prev => prev.filter(t => t.projectId !== projectId));
    setLogs(prev => prev.filter(l => l.projectId !== projectId));
    setSelectedProjectId(null); // Go back to project list
  };
  
  const handleProjectSubmit = (projectData: Omit<Project, 'id' | 'progress'> & { id?: string }) => {
    if (projectData.id) { // Update
        setProjects(prev => prev.map(p => p.id === projectData.id ? { ...p, ...projectData } as Project : p));
    } else { // Create
        const newProject: Project = {
            ...projectData,
            id: `p${Date.now()}`,
            progress: 0,
        };
        setProjects(prev => [newProject, ...prev]);
    }
    setIsProjectModalOpen(false);
  };

  const handleBackToProjects = () => {
    setSelectedProjectId(null);
  };

  const handleTaskMove = (draggedTaskId: string, targetTaskId: string | null, newStatus: TaskStatus) => {
    setTasks(currentTasks => {
        const draggedTask = currentTasks.find(t => t.id === draggedTaskId);
        if (!draggedTask) return currentTasks;

        // All tasks in the destination column, sorted, excluding the one being dragged
        const destinationTasks = currentTasks
            .filter(t => t.status === newStatus && t.id !== draggedTaskId)
            .sort((a, b) => a.order - b.order);

        let newOrder: number;

        if (targetTaskId) {
            const targetTaskIndex = destinationTasks.findIndex(t => t.id === targetTaskId);
            
            // This should not happen if targetTaskId is valid, but as a fallback
            if (targetTaskIndex === -1) { 
                const lastTask = destinationTasks[destinationTasks.length - 1];
                newOrder = lastTask ? lastTask.order + 10 : 10;
            } else {
                const prevTask = destinationTasks[targetTaskIndex - 1];
                const targetTask = destinationTasks[targetTaskIndex];
                
                const prevOrder = prevTask ? prevTask.order : 0;
                // targetTask should always exist here
                const targetOrder = targetTask.order;
                
                newOrder = (prevOrder + targetOrder) / 2;
            }
        } else {
            // Dropped on the column itself (at the end)
            const lastTask = destinationTasks[destinationTasks.length - 1];
            newOrder = lastTask ? lastTask.order + 10 : 10; // If column is empty, order is 10
        }

        return currentTasks.map(task =>
            task.id === draggedTaskId
                ? { ...task, status: newStatus, order: newOrder }
                : task
        );
    });
  };

  const handleTaskCreate = (taskData: Omit<Task, 'id' | 'status'>) => {
    const newTask: Task = {
        ...taskData,
        id: `t${Date.now()}`,
        status: TaskStatus.ToDo,
        order: Date.now(), // Simple way to add to end of list
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
  };
  
  const handleTaskDelete = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleLogSubmit = (logData: Omit<Log, 'id' | 'userId'>) => {
    const newLog: Log = {
        ...logData,
        id: `l${Date.now()}`,
        userId: currentUser.id,
    };
    setLogs(prevLogs => [newLog, ...prevLogs]);
    setIsLogModalOpen(false);
  };

  const handleCommentAdd = (taskId: string, text: string) => {
    const newComment: Comment = {
      id: `c${Date.now()}`,
      taskId,
      userId: currentUser.id,
      text,
      timestamp: new Date().toISOString(),
    };
    setComments(prev => [newComment, ...prev]);
  };

  const renderContent = () => {
    if (currentPage === 'projects') {
      if (selectedProject) {
        return <ProjectDetail 
                    project={selectedProject} 
                    projects={projects}
                    users={users} 
                    logs={logs} 
                    tasks={tasks}
                    comments={comments}
                    currentUser={currentUser}
                    onBack={handleBackToProjects}
                    onTaskMove={handleTaskMove}
                    onTaskCreate={handleTaskCreate}
                    onProjectUpdate={(project) => handleOpenEditProjectModal(project)}
                    onProjectDelete={handleProjectDelete}
                    onTaskDelete={handleTaskDelete}
                    onCommentAdd={handleCommentAdd}
                />;
      }
      return <ProjectsView 
                projects={projects}
                users={users}
                tasks={tasks}
                currentUser={currentUser}
                onProjectSelect={handleProjectSelect}
                onOpenCreateModal={handleOpenCreateProjectModal}
                onOpenEditModal={handleOpenEditProjectModal}
             />;
    }
    if (currentPage === 'my-tasks') {
        return <MyTasksView tasks={tasks} projects={projects} currentUser={currentUser} />;
    }
    if (currentPage === 'daily-logs') {
        return <DailyLogsView logs={logs} users={users} projects={projects} />;
    }
    if (currentPage === 'reporting') {
        return <ReportingView projects={projects} tasks={tasks} users={users} />;
    }
    // Default to dashboard
    return <Dashboard 
            projects={projects} 
            logs={logs} 
            tasks={tasks} 
            users={users} 
            currentUser={currentUser} 
            onProjectSelect={handleProjectSelect} 
            onOpenEditModal={handleOpenEditProjectModal}
           />;
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-neutral-100">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        setSelectedProject={setSelectedProjectId}
        currentUser={currentUser}
        onOpenLogModal={() => setIsLogModalOpen(true)}
        onLogout={onLogout}
      />
      <main className="flex-1">
        {renderContent()}
      </main>
      <Footer />
      {currentUser.role !== UserRole.Executive && (
        <LogSubmissionModal
            show={isLogModalOpen}
            onClose={() => setIsLogModalOpen(false)}
            onSubmit={handleLogSubmit}
            projects={userProjects}
        />
      )}
      {currentUser.role === UserRole.Manager && (
         <ProjectModal
            show={isProjectModalOpen}
            onClose={() => setIsProjectModalOpen(false)}
            onSubmit={handleProjectSubmit}
            users={users}
            projectToEdit={projectToEdit}
         />
      )}
    </div>
  );
};

export default App;