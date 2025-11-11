

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import ProjectDetail from './components/ProjectDetail.tsx';
import MyTasksView from './components/MyTasksView.tsx';
import ReportingView from './components/ReportingView.tsx';
import DailyLogsView from './components/DailyLogsView.tsx';
import LogSubmissionModal from './components/LogSubmissionModal.tsx';
import Footer from './components/Footer.tsx';
import ProjectsView from './components/ProjectsView.tsx';
import ProjectModal from './components/ProjectModal.tsx';
import SettingsView from './components/SettingsView.tsx';
import TeamView from './components/TeamView.tsx';
import SendNotificationModal from './components/SendNotificationModal.tsx';
import RegisterMemberModal from './components/RegisterMemberModal.tsx';
import { USERS as MOCK_USERS, PROJECTS as MOCK_PROJECTS, LOGS as MOCK_LOGS, TASKS as MOCK_TASKS, COMMENTS as MOCK_COMMENTS, NOTIFICATIONS as MOCK_NOTIFICATIONS } from './data.ts';
import { User, Project, Log, UserRole, Task, TaskStatus, Comment, UserSettings, Notification, ProjectStatus } from './types.ts';
import { ToastProvider } from './contexts/ToastContext.tsx';
import { useToast } from './hooks/useToast.ts';

type AppProps = {
  currentUser: User;
  onLogout: () => void;
};

const API_BASE_URL = 'http://localhost:4000/api';

const AppContent: React.FC<AppProps> = ({ currentUser, onLogout }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersRes, projectsRes, logsRes, tasksRes, commentsRes, notifsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users`),
        fetch(`${API_BASE_URL}/projects`),
        fetch(`${API_BASE_URL}/logs`),
        fetch(`${API_BASE_URL}/tasks`),
        fetch(`${API_BASE_URL}/comments`),
        fetch(`${API_BASE_URL}/notifications`),
      ]);

      if (!usersRes.ok || !projectsRes.ok || !logsRes.ok || !tasksRes.ok || !commentsRes.ok || !notifsRes.ok) {
        throw new Error('Network response was not ok');
      }

      setUsers(await usersRes.json());
      setProjects(await projectsRes.json());
      setLogs(await logsRes.json());
      setTasks(await tasksRes.json());
      setComments(await commentsRes.json());
      setNotifications(await notifsRes.json());
      
      showToast('Successfully connected to the database.', 'success');
    } catch (error) {
      console.error("Failed to fetch data from API:", error);
      showToast('API Connection Failed. Is the backend server running? Using mock data instead.', 'error');
      // Fallback to mock data
      setUsers(MOCK_USERS);
      setProjects(MOCK_PROJECTS);
      setLogs(MOCK_LOGS);
      setTasks(MOCK_TASKS);
      setComments(MOCK_COMMENTS);
      setNotifications(MOCK_NOTIFICATIONS);
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // API Helper
  const apiCall = async (endpoint: string, method: string, body?: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }
      return response.status === 204 ? null : await response.json();
    } catch (error: any) {
      console.error(`API call failed for ${method} ${endpoint}:`, error);
      let friendlyMessage = 'An unexpected error occurred.';
      if (error.message === 'Failed to fetch') {
          friendlyMessage = 'Network Error: Could not connect to API. Please ensure the backend server is running.';
      } else {
          friendlyMessage = error.message;
      }
      showToast(friendlyMessage, 'error');
      throw error; // Re-throw to be caught by the calling function
    }
  };


  // --- Data Manipulation Handlers ---

  const handleProjectCreate = async (projectData: Omit<Project, 'id' | 'progress'>) => {
    const newProject = {
      ...projectData,
      id: `p${Date.now()}`,
      progress: 0,
    };
    setProjects(prev => [...prev, newProject]); // Optimistic update
    try {
      const savedProject = await apiCall('/projects', 'POST', newProject);
      setProjects(prev => prev.map(p => p.id === newProject.id ? savedProject : p));
      showToast('Project created successfully!', 'success');
      setIsProjectModalOpen(false);
    } catch (error) {
      setProjects(prev => prev.filter(p => p.id !== newProject.id)); // Revert
    }
  };
  
  const handleProjectUpdate = async (projectData: Omit<Project, 'id'> & { id: string }) => {
      const originalProjects = projects;
      setProjects(prev => prev.map(p => p.id === projectData.id ? {...p, ...projectData} : p)); // Optimistic
      try {
          const updatedProject = await apiCall(`/projects/${projectData.id}`, 'PUT', projectData);
          setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
          showToast('Project updated successfully!', 'success');
          setIsProjectModalOpen(false);
          setProjectToEdit(null);
      } catch (error) {
          setProjects(originalProjects); // Revert
      }
  };

  const handleProjectDelete = async (projectId: string) => {
    const originalProjects = projects;
    setProjects(prev => prev.filter(p => p.id !== projectId));
    try {
        await apiCall(`/projects/${projectId}`, 'DELETE');
        showToast('Project deleted successfully.', 'success');
        if (selectedProjectId === projectId) {
            setSelectedProjectId(null);
            setCurrentPage('projects');
        }
    } catch (error) {
        setProjects(originalProjects); // Revert
    }
  };

  const handleTaskCreate = async (taskData: Omit<Task, 'id' | 'status' | 'order' | 'dependencies'>) => {
      const highestOrder = Math.max(0, ...tasks.filter(t => t.projectId === taskData.projectId).map(t => t.order));
      const newTask = {
          ...taskData,
          id: `t${Date.now()}`,
          status: TaskStatus.ToDo,
          order: highestOrder + 1,
          dependencies: [],
      };
      setTasks(prev => [...prev, newTask]); // Optimistic
      try {
          const savedTask = await apiCall('/tasks', 'POST', newTask);
          setTasks(prev => prev.map(t => t.id === newTask.id ? savedTask : t));
          showToast('Task created successfully!', 'success');
      } catch (error) {
          setTasks(prev => prev.filter(t => t.id !== newTask.id)); // Revert
      }
  };

    const handleTaskUpdate = async (taskId: string, updates: Partial<Omit<Task, 'id'>>) => {
        const originalTasks = tasks;
        const taskToUpdate = tasks.find(t => t.id === taskId);
        if (!taskToUpdate) return;
        const updatedTaskData = { ...taskToUpdate, ...updates };

        setTasks(prev => prev.map(t => t.id === taskId ? updatedTaskData : t)); // Optimistic
        try {
            const savedTask = await apiCall(`/tasks/${taskId}`, 'PUT', updatedTaskData);
            setTasks(prev => prev.map(t => t.id === taskId ? savedTask : t));
            showToast('Task updated.', 'info');
        } catch (error) {
            setTasks(originalTasks); // Revert
        }
    };
    
    const handleTaskDelete = async (taskId: string) => {
        const originalTasks = tasks;
        setTasks(prev => prev.filter(t => t.id !== taskId));
        try {
            await apiCall(`/tasks/${taskId}`, 'DELETE');
            showToast('Task deleted.', 'success');
        } catch (error) {
            setTasks(originalTasks); // Revert
        }
    };

    const handleTaskMove = (draggedTaskId: string, targetTaskId: string | null, newStatus: TaskStatus) => {
        const tasksInNewStatus = tasks.filter(t => t.status === newStatus && t.id !== draggedTaskId).sort((a,b) => a.order - b.order);
        
        let newOrder: number;
        if (targetTaskId === null) { // Dropped at the end of the list
            const lastTask = tasksInNewStatus[tasksInNewStatus.length - 1];
            newOrder = lastTask ? lastTask.order + 1 : 1;
        } else {
            const targetIndex = tasksInNewStatus.findIndex(t => t.id === targetTaskId);
            const prevTask = tasksInNewStatus[targetIndex - 1];
            const nextTask = tasksInNewStatus[targetIndex];
            const prevOrder = prevTask ? prevTask.order : 0;
            const nextOrder = nextTask.order;
            newOrder = (prevOrder + nextOrder) / 2;
        }
        
        handleTaskUpdate(draggedTaskId, { status: newStatus, order: newOrder });
    };

    const handleLogSubmit = async (logData: Omit<Log, 'id' | 'userId'>) => {
        const newLog = {
            ...logData,
            id: `l${Date.now()}`,
            userId: currentUser.id,
        };
        setLogs(prev => [newLog, ...prev]);
        try {
            const savedLog = await apiCall('/logs', 'POST', newLog);
            setLogs(prev => prev.map(l => l.id === newLog.id ? savedLog : l));
            showToast('Log submitted successfully!', 'success');
        } catch (error) {
            setLogs(prev => prev.filter(l => l.id !== newLog.id));
        }
    };

    const handleCommentAdd = async (taskId: string, text: string) => {
        const newComment = {
            id: `c${Date.now()}`,
            taskId,
            userId: currentUser.id,
            text,
            timestamp: new Date().toISOString(),
        };
        setComments(prev => [...prev, newComment]);
        try {
            const savedComment = await apiCall('/comments', 'POST', newComment);
            setComments(prev => prev.map(c => c.id === newComment.id ? savedComment : c));
        } catch (error) {
            setComments(prev => prev.filter(c => c.id !== newComment.id));
        }
    };

    const handleRegisterMember = async (userData: { name: string; email: string; role: UserRole }) => {
        const newUser: User = {
            ...userData,
            id: `u${Date.now()}`,
            avatar: `https://i.pravatar.cc/150?u=${userData.email}`,
            settings: { notifications: { logReminder: { email: true, telegram: false, time: '17:00' } } }
        };
        setUsers(prev => [...prev, newUser]);
        try {
            const savedUser = await apiCall('/users', 'POST', newUser);
            setUsers(prev => prev.map(u => u.id === newUser.id ? savedUser : u));
            showToast('User registered successfully!', 'success');
            setIsRegisterModalOpen(false);
        } catch(error) {
            setUsers(prev => prev.filter(u => u.id !== newUser.id));
        }
    };
    
    const handleSendNotification = async (message: string, recipientIds: string[]) => {
        const newNotifications: Notification[] = recipientIds.map(rId => ({
            id: `n${Date.now()}${rId}`,
            recipientId: rId,
            senderId: currentUser.id,
            message,
            timestamp: new Date().toISOString(),
            isRead: false
        }));
        setNotifications(prev => [...newNotifications, ...prev]);
        try {
            const savedNotifications = await apiCall('/notifications', 'POST', { notifications: newNotifications });
            setNotifications(prev => {
                const otherNotifs = prev.filter(n => !savedNotifications.some((sn: Notification) => sn.id === n.id));
                return [...savedNotifications, ...otherNotifs];
            });
            showToast(`Notification sent to ${recipientIds.length} user(s).`, 'success');
            setIsNotifModalOpen(false);
        } catch(error) {
            setNotifications(prev => prev.filter(n => !newNotifications.some(nn => nn.id === n.id)));
        }
    };
    
    const handleSendReminder = (recipientId: string) => {
      handleSendNotification("Please remember to submit your daily log for today.", [recipientId]);
    };

    const handleMarkNotificationAsRead = async (id: string | 'all') => {
        const originalNotifications = notifications;
        if (id === 'all') {
            setNotifications(prev => prev.map(n => n.recipientId === currentUser.id ? { ...n, isRead: true } : n));
             try {
                const updated = await apiCall('/notifications/mark-all-read', 'PUT', { recipientId: currentUser.id });
                setNotifications(prev => {
                   const otherNotifs = prev.filter(n => n.recipientId !== currentUser.id);
                   const myNotifs = prev.filter(n => n.recipientId === currentUser.id).map(n => updated.find((un:Notification) => un.id === n.id) || n);
                   return [...otherNotifs, ...myNotifs];
                });
             } catch(e) { setNotifications(originalNotifications); }
        } else {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            try {
                await apiCall(`/notifications/${id}`, 'PUT', { isRead: true });
            } catch(e) { setNotifications(originalNotifications); }
        }
    };
    
    const handleUpdateUserSettings = async (settings: UserSettings) => {
        const originalUsers = users;
        setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, settings } : u));
        try {
            await apiCall(`/users/${currentUser.id}/settings`, 'PUT', { settings });
            showToast('Settings updated!', 'success');
        } catch (error) {
            setUsers(originalUsers);
        }
    };

    const handleUpdateUserProfile = async (profileData: { name: string; email: string; avatar: string }) => {
        const originalUsers = users;
        setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...profileData } : u));
        try {
            await apiCall(`/users/${currentUser.id}/profile`, 'PUT', profileData);
            showToast('Profile updated!', 'success');
        } catch (error) {
            setUsers(originalUsers);
        }
    };
    
  // --- Computed data for views ---

  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) || null;
  }, [selectedProjectId, projects]);

  const fullCurrentUser = useMemo(() => 
    users.find(u => u.id === currentUser.id) || currentUser
  , [users, currentUser]);

  const membersForDailyStatus = useMemo(() => {
    if (currentUser.role === UserRole.Manager) {
        const managedProjectIds = new Set(projects.filter(p => p.team.includes(currentUser.id)).map(p => p.id));
        const memberIds = new Set<string>();
        projects.forEach(p => {
            if (managedProjectIds.has(p.id)) {
                p.team.forEach(uid => memberIds.add(uid));
            }
        });
        return users.filter(u => memberIds.has(u.id) && u.role === UserRole.Member);
    }
    return [];
  }, [currentUser.id, currentUser.role, projects, users]);
  
  const teamMembersForManager = useMemo(() => {
      if(currentUser.role === UserRole.Executive) return users.filter(u => u.id !== currentUser.id);
      
      const managedTeamIds = new Set<string>();
      projects.forEach(p => {
        if(p.team.includes(currentUser.id)) {
            p.team.forEach(id => managedTeamIds.add(id));
        }
      });
      return users.filter(u => managedTeamIds.has(u.id) && u.id !== currentUser.id);
  }, [currentUser.id, currentUser.role, projects, users]);


  // --- Render logic ---

  const openProjectEditModal = (project: Project) => {
    setProjectToEdit(project);
    setIsProjectModalOpen(true);
  };
  
  const openProjectCreateModal = () => {
    setProjectToEdit(null);
    setIsProjectModalOpen(true);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-brand-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-neutral-600 font-semibold">Connecting to Database...</p>
          </div>
        </div>
      );
    }

    if (selectedProject) {
      return <ProjectDetail
                project={selectedProject}
                projects={projects}
                users={users}
                logs={logs}
                tasks={tasks}
                comments={comments}
                currentUser={currentUser}
                onBack={() => setSelectedProjectId(null)}
                onTaskMove={handleTaskMove}
                onTaskCreate={handleTaskCreate}
                onProjectUpdate={() => openProjectEditModal(selectedProject)}
                onProjectDelete={handleProjectDelete}
                onTaskDelete={handleTaskDelete}
                onCommentAdd={handleCommentAdd}
                onUpdateTask={handleTaskUpdate}
              />;
    }
    
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard projects={projects} logs={logs} tasks={tasks} users={users} currentUser={currentUser} onProjectSelect={setSelectedProjectId} onOpenEditModal={openProjectEditModal} membersForDailyStatus={membersForDailyStatus} onSendReminder={handleSendReminder} />;
      case 'projects':
        return <ProjectsView projects={projects} users={users} tasks={tasks} currentUser={currentUser} onProjectSelect={setSelectedProjectId} onOpenCreateModal={openProjectCreateModal} onOpenEditModal={openProjectEditModal} />;
      case 'my-tasks':
        return <MyTasksView tasks={tasks} projects={projects} currentUser={currentUser} />;
      case 'daily-logs':
        return <DailyLogsView logs={logs} users={users} projects={projects} />;
      case 'team':
        return <TeamView teamMembers={teamMembersForManager} tasks={tasks} logs={logs} currentUser={currentUser} onOpenNotificationModal={() => setIsNotifModalOpen(true)} onOpenRegisterModal={() => setIsRegisterModalOpen(true)} />;
      case 'reporting':
        return <ReportingView projects={projects} tasks={tasks} users={users} />;
      case 'settings':
        return <SettingsView currentUser={fullCurrentUser} onUpdateUserSettings={handleUpdateUserSettings} onUpdateUserProfile={handleUpdateUserProfile} />;
      default:
        return <Dashboard projects={projects} logs={logs} tasks={tasks} users={users} currentUser={currentUser} onProjectSelect={setSelectedProjectId} onOpenEditModal={openProjectEditModal} membersForDailyStatus={membersForDailyStatus} onSendReminder={handleSendReminder} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100 font-sans">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        setSelectedProject={setSelectedProjectId}
        currentUser={currentUser}
        notifications={notifications}
        users={users}
        onOpenLogModal={() => setIsLogModalOpen(true)}
        onLogout={onLogout}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
      />
      <main className="flex-grow">
        {renderContent()}
      </main>
      <Footer />
      {/* Modals */}
      <LogSubmissionModal 
        show={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSubmit={handleLogSubmit}
        projects={projects.filter(p => p.team.includes(currentUser.id) && p.status !== ProjectStatus.Completed)}
        users={users}
        currentUserId={currentUser.id}
      />
      <ProjectModal
        show={isProjectModalOpen}
        onClose={() => { setIsProjectModalOpen(false); setProjectToEdit(null); }}
        onSubmit={projectToEdit ? handleProjectUpdate : handleProjectCreate}
        users={users}
        projectToEdit={projectToEdit}
      />
      <SendNotificationModal
        show={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        onSubmit={handleSendNotification}
        teamMembers={teamMembersForManager}
      />
      <RegisterMemberModal
        show={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSubmit={handleRegisterMember}
        users={users}
      />
    </div>
  );
};


// Main App component with ToastProvider
const App: React.FC<AppProps> = ({ currentUser, onLogout }) => {
  return (
    <ToastProvider>
      <AppContent currentUser={currentUser} onLogout={onLogout} />
    </ToastProvider>
  );
};

export default App;