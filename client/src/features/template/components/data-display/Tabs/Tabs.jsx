import React from 'react';
import './Tabs.scss';

const Tabs = ({ tabs = [], activeTab, onChange }) => (
    <div className="t-tabs" role="tablist">
        {tabs.map((tab) => (
            <button
                key={tab.key}
                role="tab"
                id={`t-tab-${tab.key}`}
                className={`t-tabs__tab ${activeTab === tab.key ? 't-tabs__tab--active' : ''}`}
                aria-selected={activeTab === tab.key}
                aria-controls={`t-tabpanel-${tab.key}`}
                onClick={() => onChange?.(tab.key)}
            >
                {tab.icon && <i className={tab.icon} aria-hidden="true" />}
                {tab.label}
            </button>
        ))}
    </div>
);

export default Tabs;
