import React from 'react';
import { ProjectList } from '../../components/projects/ProjectList';

interface ProjectsPageProps {
  onOpenNewProject?: () => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onOpenNewProject }) => {
  return (
    <div className="space-y-6">
      <ProjectList onOpenNewProject={onOpenNewProject} />
    </div>
  );
};
