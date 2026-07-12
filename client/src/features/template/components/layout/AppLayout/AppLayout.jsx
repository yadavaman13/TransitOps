// client/src/features/template/components/layout/AppLayout/AppLayout.jsx
import React from 'react';
import './AppLayout.scss';

/**
 * AppLayout — root shell for all authenticated ERP pages.
 *
 * @param {React.ReactNode} sidebar   - Rendered Sidebar node
 * @param {React.ReactNode} topbar    - Optional TopNavbar node
 * @param {React.ReactNode} children  - Page content
 */
const AppLayout = ({ sidebar, topbar, children }) => (
    <div className="t-app-layout">
        {sidebar && (
            <div className="t-app-layout__sidebar">
                {sidebar}
            </div>
        )}
        <div className="t-app-layout__main">
            {topbar && topbar}
            <main className="t-app-layout__content">
                {children}
            </main>
        </div>
    </div>
);

export default AppLayout;
