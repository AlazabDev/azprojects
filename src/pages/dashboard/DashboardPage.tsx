import React from 'react';
import { DashboardOverview } from '../../components/dashboard/DashboardOverview';

interface DashboardPageProps {
  onOpenNewProject?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenNewProject }) => {
  return (
    <div className="space-y-6">
      <DashboardOverview onOpenNewProject={onOpenNewProject} />
    </div>
  );
};
