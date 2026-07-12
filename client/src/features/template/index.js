// client/src/features/template/index.js
// ERP Starter Kit — Master barrel export
// Usage: import { Button, DataTable, useToast } from '@/features/template';

// Layout
export { default as AppLayout }   from './components/layout/AppLayout/index.js';
export { default as Sidebar }     from './components/layout/Sidebar/index.js';
export { default as TopNavbar }   from './components/layout/TopNavbar/index.js';

// UI
export { default as Button }      from './components/ui/Button/index.js';
export { default as Badge }       from './components/ui/Badge/index.js';
export { default as Card }        from './components/ui/Card/index.js';
export { default as StatCard }    from './components/ui/StatCard/index.js';
export { default as Dropdown }    from './components/ui/Dropdown/index.js';

// Forms
export { default as Input }       from './components/forms/Input/index.js';
export { default as Select }      from './components/forms/Select/index.js';
export { default as DatePicker }  from './components/forms/DatePicker/index.js';
export { default as FileUpload }  from './components/forms/FileUpload/index.js';
export { default as Form, FormSection, FormRow, FormActions } from './components/forms/Form/index.js';

// Data Display
export { default as DataTable }   from './components/data-display/DataTable/index.js';
export { default as Tabs }        from './components/data-display/Tabs/index.js';

// Navigation
export { default as Breadcrumb }  from './components/navigation/Breadcrumb/index.js';
export { default as SearchBar }   from './components/navigation/SearchBar/index.js';

// Overlays
export { default as Modal }          from './components/overlays/Modal/index.js';
export { default as ConfirmDialog }  from './components/overlays/ConfirmDialog/index.js';

// Feedback
export { ToastProvider, useToast } from './components/feedback/Toast/index.js';

// Dashboard
export { default as FilterPanel } from './components/dashboard/FilterPanel/index.js';

// Pages / Templates (import directly)
// import DashboardTemplatePage from '@/features/template/pages/DashboardTemplatePage';
// import CrudTemplatePage from '@/features/template/pages/CrudTemplatePage';
