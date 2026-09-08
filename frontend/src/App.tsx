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
import { UploadModal } from './components/modals/UploadModal';
import { EmployeeDetailModal } from './components/modals/EmployeeDetailModal';
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
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

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
      setCurrentTab('departments');
    } else if (action.category === 'Training') {
      setCurrentTab('analytics');
    } else {
      setCurrentTab('employees');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
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
            window.location.href = api.getExportUrl('csv');
          }}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          isLoadingDemo={isLoadingDemo}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (q.trim() && currentTab === 'dashboard') {
              // keep on dashboard or let user browse
            }
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
            />
          )}

          {currentTab === 'employees' && (
            <EmployeesPage
              onViewEmployee={(id) => setSelectedEmployeeId(id)}
              globalSearch={searchQuery}
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
            <DepartmentsPage />
          )}

          {currentTab === 'reports' && (
            <ReportsPage />
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

      {/* Employee Detail Modal */}
      <EmployeeDetailModal
        employeeId={selectedEmployeeId}
        onClose={() => setSelectedEmployeeId(null)}
      />
    </div>
  );
};
