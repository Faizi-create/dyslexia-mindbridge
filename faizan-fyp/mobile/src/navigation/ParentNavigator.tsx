import React from 'react';
import { ParentTabs } from './ParentTabs';
import { ParentProvider } from '@/context/ParentContext';

export const ParentNavigator: React.FC = () => (
  <ParentProvider>
    <ParentTabs />
  </ParentProvider>
);
