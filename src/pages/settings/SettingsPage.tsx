import React from 'react';
import { SystemSettings } from '../../components/settings/SystemSettings';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <SystemSettings />
    </div>
  );
};
