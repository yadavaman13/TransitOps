import React from 'react';
import Select from '../../forms/Select/index.js';
import Button from '../../ui/Button/index.js';
import './FilterPanel.scss';

const FilterPanel = ({ filters = [], values = {}, onChange, onReset, inline = false }) => (
    <div className={`t-filter-panel ${inline ? 't-filter-panel--inline' : ''}`}>
        {filters.map((f) => (
            <div 
                key={f.key} 
                className={[
                    't-filter-panel__group',
                    inline ? 't-filter-panel__group--inline' : '',
                ].filter(Boolean).join(' ')}
            >
                <span className="t-filter-panel__label">{f.label}</span>
                <Select
                    options={f.options}
                    value={values[f.key] ?? ''}
                    onChange={(e) => onChange?.(f.key, e.target.value)}
                    placeholder={`All ${f.label}`}
                    clearable
                    inline={inline}
                    size="sm"
                />
            </div>
        ))}
        {onReset && (
            <div className="t-filter-panel__actions">
                <Button variant="ghost" size="sm" iconLeft="ri-refresh-line" onClick={onReset}>
                    Reset
                </Button>
            </div>
        )}
    </div>
);

export default FilterPanel;
