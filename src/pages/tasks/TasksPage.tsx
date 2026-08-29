import React from 'react';
import { KanbanBoard } from '../../components/tasks/KanbanBoard';

export const TasksPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <KanbanBoard />
    </div>
  );
};
