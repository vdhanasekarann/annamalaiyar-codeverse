import React from 'react';
import IconSidebar from './IconSidebar';
import ExpandSidebar from './ExpandSidebar';
import BackdropOverlay from './BackdropOverlay';
import { useSidebar } from '../../context/SidebarContext';

const defaultItems = [
  { path: '/dashboard', label: 'Home', icon: '🏠' },
  { path: '/gpts', label: 'GPTs', icon: '🤖' },
  { path: '/terms', label: 'Terms', icon: '📄' },
  { path: '/premium', label: 'Premium', icon: '💎' },
];

export default function DoubleSidebar({ items = defaultItems, mobile=false, onNavigate }) {
  const { collapsed, setCollapsed } = useSidebar();

  return (
    <>
      <IconSidebar items={items} />
      <ExpandSidebar items={items} mobile={mobile} onNavigate={onNavigate} />
      {mobile && !collapsed && <BackdropOverlay onClick={() => setCollapsed(true)} />}
    </>
  );
}
