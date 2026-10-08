import React, { useState, useEffect } from 'react';
import { Sidebar, NavigationModule } from './components/Sidebar';
import { Header } from './components/Header';
import { CommandPalette } from './components/CommandPalette';
import { NotificationsDrawer, NotificationItem } from './components/NotificationsDrawer';

// Module Pages
import { DashboardPage } from './pages/DashboardPage';
import { ProspectingPage } from './pages/ProspectingPage';
import { CrmPage } from './pages/CrmPage';
import { ClientsPage } from './pages/ClientsPage';
import { BriefingsPage } from './pages/BriefingsPage';
import { QuotesPage } from './pages/QuotesPage';
import { ProposalsPage } from './pages/ProposalsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SitesPage } from './pages/SitesPage';
import { PromptsPage } from './pages/PromptsPage';
import { AutomationsPage } from './pages/AutomationsPage';
import { MessagesPage } from './pages/MessagesPage';
import { FinancialPage } from './pages/FinancialPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ClientPortalPage } from './pages/ClientPortalPage';
export const App: React.FC = () => {
  // Check if current URL is a client portal route: /portal/:token
  const pathname = window.location.pathname;
  const portalMatch = pathname.match(/\/portal\/([^/]+)/);
  const portalToken = portalMatch ? portalMatch[1] : null;

  const [currentModule, setCurrentModule] = useState<NavigationModule>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Cross-module states
  const [leadForSite, setLeadForSite] = useState<any>(null);
  const [quoteForProposal, setQuoteForProposal] = useState<any>(null);

  // Initialize Theme from localStorage or default light (warm stone from PDF)
  useEffect(() => {
    const savedTheme = (localStorage.getItem('praxis_theme') as 'dark' | 'light') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (!portalToken) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [portalToken]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
    }
  };

  const handleToggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('praxis_theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  // If in client portal mode, render isolated portal layout
  if (portalToken) {
    return <ClientPortalPage portalToken={portalToken} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground antialiased font-sans relative selection:bg-primary selection:text-black">
      {/* Background Ambient Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 w-[600px] h-[400px] bg-primary/15 rounded-full blur-[140px] opacity-40"></div>
        <div className="absolute top-[50%] -left-40 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[160px] opacity-30"></div>
        <div className="absolute -bottom-40 right-10 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[180px] opacity-30"></div>
      </div>

      {/* 15 Modules Sidebar */}
      <Sidebar
        currentModule={currentModule}
        onSelectModule={setCurrentModule}
        unreadNotificationsCount={unreadCount}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Top Header */}
        <Header
          currentModule={currentModule}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          unreadCount={unreadCount}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Page View Container */}
        <main className="flex-1 overflow-y-auto bg-background/50">
          {currentModule === 'dashboard' && <DashboardPage onNavigate={setCurrentModule} />}
          {currentModule === 'prospecting' && <ProspectingPage onNavigate={setCurrentModule} />}
          {currentModule === 'crm' && (
            <CrmPage
              onNavigate={setCurrentModule}
              onSelectLeadForSite={(lead) => {
                setLeadForSite(lead);
                setCurrentModule('sites');
              }}
            />
          )}
          {currentModule === 'clients' && <ClientsPage onNavigate={setCurrentModule} />}
          {currentModule === 'briefings' && <BriefingsPage onNavigate={setCurrentModule} />}
          {currentModule === 'quotes' && (
            <QuotesPage
              onNavigate={setCurrentModule}
              onSetGeneratedQuote={(q) => {
                setQuoteForProposal(q);
                setCurrentModule('proposals');
              }}
            />
          )}
          {currentModule === 'proposals' && (
            <ProposalsPage onNavigate={setCurrentModule} initialQuoteData={quoteForProposal} />
          )}
          {currentModule === 'projects' && <ProjectsPage onNavigate={setCurrentModule} />}
          {currentModule === 'sites' && (
            <SitesPage onNavigate={setCurrentModule} preSelectedLead={leadForSite} />
          )}
          {currentModule === 'prompts' && <PromptsPage onNavigate={setCurrentModule} />}
          {currentModule === 'automations' && <AutomationsPage onNavigate={setCurrentModule} />}
          {currentModule === 'messages' && <MessagesPage onNavigate={setCurrentModule} />}
          {currentModule === 'financial' && <FinancialPage onNavigate={setCurrentModule} />}
          {currentModule === 'reports' && <ReportsPage onNavigate={setCurrentModule} />}
          {currentModule === 'settings' && <SettingsPage onNavigate={setCurrentModule} />}
        </main>
      </div>

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(mod) => setCurrentModule(mod)}
      />

      {/* Notifications Slide-Over Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </div>
  );
};
export default App;
