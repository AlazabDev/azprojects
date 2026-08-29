import React from 'react';
import { DocumentManager } from '../../components/documents/DocumentManager';

export const DocumentsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <DocumentManager />
    </div>
  );
};
