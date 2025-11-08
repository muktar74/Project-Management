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
import SettingsView from './components/SettingsView';
import TeamView from './components/TeamView';
import SendNotificationModal from './components/SendNotificationModal';
import RegisterMemberModal from './components/RegisterMemberModal';
import { USERS, PROJECTS, LOGS, TASKS, COMMENTS, NOTIFICATIONS } from './data';
import { User, Project, Log, UserRole, Task, TaskStatus, Comment, UserSettings, Notification } from './types';

type AppProps = {
  currentUser: User;
  onLogout: () => void;
};

const App: React.FC<AppProps> = ({ currentUser, onLogout }) => {
  const [users, setUsers] = useState<User[]>(USERS);
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [logs, setLogs] = useState<Log[]>(LOGS);
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [comments, setComments] = useState<Comment[]>(COMMENTS);
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
  
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  
  const appCurrentUser = useMemo(() => users.find(u => u.id === currentUser.id)!, [users, currentUser.id]);

  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) || null;
  }, [selectedProjectId, projects]);
  
  const userProjects = useMemo(() => {
    return projects.filter(p => p.team.includes(appCurrentUser.id) && p.status !== 'Completed');
  }, [projects, appCurrentUser]);
  
  const managedTeamMembers = useMemo(() => {
    if (appCurrentUser.role !== UserRole.Manager) return [];
    const managerProjectIds = new Set(projects.filter(p => p.team.includes(appCurrentUser.id)).map(p => p.id));
    const teamMemberIds = new Set(projects.filter(p => managerProjectIds.has(p.id)).flatMap(p => p.team));
    return users.filter(u => teamMemberIds.has(u.id) && u.id !== appCurrentUser.id).sort((a,b) => a.name.localeCompare(b.name));
  }, [users, projects, appCurrentUser]);

  const membersForTeamView = useMemo(() => {
    if (appCurrentUser.role === UserRole.Executive) {
        return users.filter(u => u.id !== appCurrentUser.id).sort((a,b) => a.name.localeCompare(b.name));
    }
    if (appCurrentUser.role === UserRole.Manager) {
        return managedTeamMembers;
    }
    return [];
  }, [users, appCurrentUser, managedTeamMembers]);

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

        const destinationTasks = currentTasks.filter(t => t.status === newStatus && t.id !== draggedTaskId).sort((a, b) => a.order - b.order);

        let newOrder: number;

        if (targetTaskId) {
            const targetTaskIndex = destinationTasks.findIndex(t => t.id === targetTaskId);
            if (targetTaskIndex === -1) { 
                const lastTask = destinationTasks[destinationTasks.length - 1];
                newOrder = lastTask ? lastTask.order + 10 : 10;
            } else {
                const prevTask = destinationTasks[targetTaskIndex - 1];
                const targetTask = destinationTasks[targetTaskIndex];
                const prevOrder = prevTask ? prevTask.order : 0;
                newOrder = (prevOrder + targetTask.order) / 2;
            }
        } else {
            const lastTask = destinationTasks[destinationTasks.length - 1];
            newOrder = lastTask ? lastTask.order + 10 : 10;
        }

        return currentTasks.map(task => task.id === draggedTaskId ? { ...task, status: newStatus, order: newOrder } : task);
    });
  };

  const handleTaskCreate = (taskData: Omit<Task, 'id' | 'status'>) => {
    const newTask: Task = {
        ...taskData,
        id: `t${Date.now()}`,
        status: TaskStatus.ToDo,
        order: Date.now(),
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
        userId: appCurrentUser.id,
    };
    setLogs(prevLogs => [newLog, ...prevLogs]);
    setIsLogModalOpen(false);
  };

  const handleCommentAdd = (taskId: string, text: string) => {
    const newComment: Comment = {
      id: `c${Date.now()}`,
      taskId,
      userId: appCurrentUser.id,
      text,
      timestamp: new Date().toISOString(),
    };
    setComments(prev => [newComment, ...prev]);
  };
  
  const handleUpdateUserSettings = (newSettings: UserSettings) => {
    setUsers(currentUsers =>
      currentUsers.map(user =>
        user.id === appCurrentUser.id ? { ...user, settings: newSettings } : user
      )
    );
  };

  const handleSendNotification = (message: string, recipientIds: string[]) => {
    const newNotifications: Notification[] = recipientIds.map(userId => ({
      id: `n${Date.now()}-${userId}`,
      recipientId: userId,
      senderId: appCurrentUser.id,
      message,
      timestamp: new Date().toISOString(),
      isRead: false,
    }));
    setNotifications(prev => [...prev, ...newNotifications]);
    setIsNotificationModalOpen(false);
  };

  const handleMarkNotificationAsRead = (notificationId: string | 'all') => {
    setNotifications(currentNotifications =>
      currentNotifications.map(n => {
        if (n.recipientId !== appCurrentUser.id) return n;
        if (notificationId === 'all' || n.id === notificationId) {
          return { ...n, isRead: true };
        }
        return n;
      })
    );
  };

  const handleRegisterMember = (userData: { name: string; email: string; role: UserRole; }) => {
    const newUser: User = {
        id: `u${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        avatar: `https://i.pravatar.cc/150?u=${userData.email}`,
        settings: {
            notifications: {
                logReminder: { email: true, telegram: false, time: '17:00' }
            }
        }
    };
    setUsers(prev => [...prev, newUser]);
    setIsRegisterModalOpen(false);
  };

  const renderContent = () => {
    switch (currentPage) {
        case 'projects':
            if (selectedProject) {
                return <ProjectDetail 
                            project={selectedProject} 
                            projects={projects}
                            users={users} 
                            logs={logs} 
                            tasks={tasks}
                            comments={comments}
                            currentUser={appCurrentUser}
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
                        currentUser={appCurrentUser}
                        onProjectSelect={handleProjectSelect}
                        onOpenCreateModal={handleOpenCreateProjectModal}
                        onOpenEditModal={handleOpenEditProjectModal}
                     />;
        case 'my-tasks':
            return <MyTasksView tasks={tasks} projects={projects} currentUser={appCurrentUser} />;
        case 'daily-logs':
            return <DailyLogsView logs={logs} users={users} projects={projects} />;
        case 'team':
            return <TeamView 
                        teamMembers={membersForTeamView} 
                        tasks={tasks} 
                        logs={logs} 
                        currentUser={appCurrentUser} 
                        onOpenNotificationModal={() => setIsNotificationModalOpen(true)}
                        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
                    />;
        case 'reporting':
            return <ReportingView projects={projects} tasks={tasks} users={users} />;
        case 'settings':
            return <SettingsView currentUser={appCurrentUser} onUpdateUserSettings={handleUpdateUserSettings} />;
        case 'dashboard':
        default:
            return <Dashboard 
                    projects={projects} 
                    logs={logs} 
                    tasks={tasks} 
                    users={users} 
                    currentUser={appCurrentUser} 
                    onProjectSelect={handleProjectSelect} 
                    onOpenEditModal={handleOpenEditProjectModal}
                   />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-neutral-100">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        setSelectedProject={setSelectedProjectId}
        currentUser={appCurrentUser}
        notifications={notifications}
        users={users}
        onOpenLogModal={() => setIsLogModalOpen(true)}
        onLogout={onLogout}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
      />
      <main className="flex-1">
        {renderContent()}
      </main>
      <Footer />
      {appCurrentUser.role !== UserRole.Executive && (
        <LogSubmissionModal
            show={isLogModalOpen}
            onClose={() => setIsLogModalOpen(false)}
            onSubmit={handleLogSubmit}
            projects={userProjects}
        />
      )}
      {appCurrentUser.role === UserRole.Manager && (
        <>
            <ProjectModal
                show={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                onSubmit={handleProjectSubmit}
                users={users}
                projectToEdit={projectToEdit}
            />
            <SendNotificationModal
                show={isNotificationModalOpen}
                onClose={() => setIsNotificationModalOpen(false)}
                onSubmit={handleSendNotification}
                teamMembers={managedTeamMembers}
            />
            <RegisterMemberModal
                show={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                onSubmit={handleRegisterMember}
            />
        </>
      )}
    </div>
  );
};

export default App;