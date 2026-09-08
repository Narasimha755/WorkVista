import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { Dashboard } from './pages/Dashboard';
import { EmployeesPage } from './pages/Employees';
import { PredictionsPage } from './pages/Predictions';
import { AnalyticsPage } from './pages/Analytics';
import { DepartmentsPage } from './pages/Departments';
import { ReportsPage } from './pages/Reports';
import { ModelPerformancePage } from './pages/ModelPerformance';
import { SettingsPage } from './pages/Settings';
import { RiskIntelligencePage } from './pages/RiskIntelligence';
import { DataStudioPage } from './pages/DataStudio';
import { ActivityPage } from './pages/Activity';
import { UploadModal } from './components/modals/UploadModal';
import { EmployeeDetailModal } from './components/modals/EmployeeDetailModal';
import { SearchModal } from './components/modals/SearchModal';
import { WorkVistaCopilotModal } from './components/copilot/WorkVistaCopilotModal';
import { WorkforceScenarioPlannerModal } from './components/modals/WorkforceScenarioPlannerModal';
import { UniversalCompareModal } from './components/modals/UniversalCompareModal';
import { DashboardData, RecommendedActionItem } from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState<boolean>(false);
  
  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  // New Phase 1 Intelligence Modals
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [copilotInitialQuery, setCopilotInitialQuery] = useState<string>('');
  const [isScenarioOpen, setIsScenarioOpen] = useState<boolean>(false);
  const [scenarioTargetDept, setScenarioTargetDept] = useState<string>('All');
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);

  // Global search
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadDashboard = async () => {
    try {
      const data = await api.getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Keyboard shortcut listener: Ctrl+K or Cmd+K opens Copilot or Omni Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCopilotOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadDashboard();
  };

  const handleLoadDemo = async () => {
    setIsLoadingDemo(true);
    try {
      await api.loadDemoData();
      await loadDashboard();
    } catch (err: any) {
      alert(`Demo data load failed: ${err.message}`);
    } finally {
      setIsLoadingDemo(false);
    }
  };

  const handleActionClick = (action: RecommendedActionItem) => {
    if (action.category === 'Intervention') {
      setCurrentTab('employees');
    } else if (action.category === 'Workload') {
      setScenarioTargetDept('Operations');
      setIsScenarioOpen(true);
    } else if (action.category === 'Training') {
      setCurrentTab('analytics');
    } else {
      setCurrentTab('employees');
    }
  };

  const handleOpenCopilotWithQuery = (q?: string) => {
    setCopilotInitialQuery(q || '');
    setIsCopilotOpen(true);
  };

  const handleOpenScenarioPlannerWithDept = (dept?: string) => {
    setScenarioTargetDept(dept || 'All');
    setIsScenarioOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-200">
      {/* Persistent Left Sidebar */}
      <Sidebar 
        currentTab={currentTab} 
        onSelectTab={setCurrentTab} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          onOpenUpload={() => setIsUploadOpen(true)}
          onLoadDemo={handleLoadDemo}
          onExport={() => {
            api.triggerExportCsv();
          }}
          onRefresh={handleRefresh}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenCopilot={() => handleOpenCopilotWithQuery('')}
          onOpenScenarioPlanner={() => handleOpenScenarioPlannerWithDept('All')}
          onOpenCompare={() => setIsCompareOpen(true)}
          onNavigateToTab={(tab) => setCurrentTab(tab as NavTab)}
          isRefreshing={isRefreshing}
          isLoadingDemo={isLoadingDemo}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
          }}
        />

        {/* Dynamic Pages */}
        <main className="flex-1 pb-12">
          {currentTab === 'dashboard' && (
            <Dashboard
              data={dashboardData}
              loading={loading}
              onOpenUpload={() => setIsUploadOpen(true)}
              onLoadDemo={handleLoadDemo}
              onViewEmployee={(id) => setSelectedEmployeeId(id)}
              onViewAllEmployees={() => setCurrentTab('employees')}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onActionClick={handleActionClick}
              onOpenCopilot={handleOpenCopilotWithQuery}
              onOpenScenarioPlanner={handleOpenScenarioPlannerWithDept}
              onOpenCompare={() => setIsCompareOpen(true)}
            />
          )}

          {currentTab === 'employees' && (
            <EmployeesPage
              onViewEmployee={(id) => setSelectedEmployeeId(id)}
              globalSearch={searchQuery}
            />
          )}

          {currentTab === 'risk-intelligence' && (
            <RiskIntelligencePage 
              onViewEmployee={(id) => setSelectedEmployeeId(id)}
            />
          )}

          {currentTab === 'predictions' && (
            <PredictionsPage
              onViewEmployees={() => setCurrentTab('employees')}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsPage />
          )}

          {currentTab === 'departments' && (
            <DepartmentsPage 
              onOpenScenarioPlanner={handleOpenScenarioPlannerWithDept}
            />
          )}

          {currentTab === 'data-studio' && (
            <DataStudioPage 
              onOpenUpload={() => setIsUploadOpen(true)}
              onRefreshDashboard={loadDashboard}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsPage />
          )}

          {currentTab === 'activity' && (
            <ActivityPage />
          )}

          {currentTab === 'model-performance' && (
            <ModelPerformancePage />
          )}

          {currentTab === 'settings' && (
            <SettingsPage />
          )}
        </main>
      </div>

      {/* Upload Dataset Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => {
          loadDashboard();
        }}
      />

      {/* Employee Detail Modal (360° + Digital Twin) */}
      <EmployeeDetailModal
        employeeId={selectedEmployeeId}
        onClose={() => setSelectedEmployeeId(null)}
      />

      {/* Global Command/Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectEmployee={(id) => setSelectedEmployeeId(id)}
        onSelectTab={(tab) => setCurrentTab(tab as NavTab)}
      />

      {/* WorkVista AI Copilot Modal */}
      <WorkVistaCopilotModal
        isOpen={isCopilotOpen}
        initialQuery={copilotInitialQuery}
        onClose={() => setIsCopilotOpen(false)}
        onViewEmployee={(id) => setSelectedEmployeeId(id)}
      />

      {/* Workforce Scenario Planner & Policy Simulator Modal */}
      <WorkforceScenarioPlannerModal
        isOpen={isScenarioOpen}
        initialDepartment={scenarioTargetDept}
        onClose={() => setIsScenarioOpen(false)}
      />

      {/* Universal Side-by-Side Compare Modal */}
      <UniversalCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        onViewEmployee={(id) => setSelectedEmployeeId(id)}
      />
    </div>
  );
};
