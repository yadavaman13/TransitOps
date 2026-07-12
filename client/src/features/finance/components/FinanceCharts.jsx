import React, { useState } from 'react';

// Color palette matching DESIGN.md
const CHART_COLORS = [
    '#714b67', // primary purple
    '#9f6a90', // secondary violet
    '#c89dbb', // soft lavender
    '#e28743', // warning orange
    '#22c55e', // success green
    '#e65b65', // danger red
    '#075985', // info blue
];

/**
 * Doughnut/Pie Chart for Expense Categories
 */
export function CategoryBreakdownChart({ data = [] }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [hoveredValue, setHoveredValue] = useState(null);

    const total = data.reduce((sum, item) => sum + Number(item.amount), 0);

    if (total === 0 || data.length === 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', color: 'var(--text-muted)' }}>
                <i className="ri-inbox-line" style={{ fontSize: '32px', marginBottom: '8px' }} />
                <span>No expense data available</span>
            </div>
        );
    }

    const radius = 50;
    const strokeWidth = 18;
    const circumference = 2 * Math.PI * radius; // ~314.16
    let accumulatedPercent = 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                <svg viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                    {data.map((item, idx) => {
                        const amount = Number(item.amount);
                        const percent = amount / total;
                        const strokeLength = percent * circumference;
                        const strokeOffset = circumference - strokeLength + (accumulatedPercent * circumference);
                        accumulatedPercent -= percent;

                        const color = CHART_COLORS[idx % CHART_COLORS.length];

                        return (
                            <circle
                                key={item.category}
                                cx="70"
                                cy="70"
                                r={radius}
                                fill="transparent"
                                stroke={color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeOffset}
                                className="svg-pie-segment"
                                onMouseEnter={() => {
                                    setHoveredIndex(idx);
                                    setHoveredValue(amount);
                                }}
                                onMouseLeave={() => {
                                    setHoveredIndex(null);
                                    setHoveredValue(null);
                                }}
                                style={{
                                    transition: 'stroke-width 0.2s',
                                    strokeWidth: hoveredIndex === idx ? strokeWidth + 2 : strokeWidth
                                }}
                            />
                        );
                    })}
                    {/* Inner hole for Doughnut */}
                    <circle cx="70" cy="70" r={radius - strokeWidth / 2 - 2} fill="var(--bg-card)" />
                </svg>
                
                {/* Centered label */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none'
                }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {hoveredIndex !== null ? data[hoveredIndex].category : 'Total'}
                    </span>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                        ${(hoveredValue !== null ? hoveredValue : total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
            </div>

            {/* Custom Legend */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px 16px', marginTop: '24px', width: '100%' }}>
                {data.map((item, idx) => {
                    const color = CHART_COLORS[idx % CHART_COLORS.length];
                    const percent = ((Number(item.amount) / total) * 100).toFixed(1);
                    return (
                        <div
                            key={item.category}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '12px',
                                color: hoveredIndex === idx ? 'var(--text-main)' : 'var(--text-muted)',
                                fontWeight: hoveredIndex === idx ? 600 : 400,
                                cursor: 'pointer'
                            }}
                            onMouseEnter={() => {
                                setHoveredIndex(idx);
                                setHoveredValue(Number(item.amount));
                            }}
                            onMouseLeave={() => {
                                setHoveredIndex(null);
                                setHoveredValue(null);
                            }}
                        >
                            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', backgroundColor: color }} />
                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.category}</span>
                            <span style={{ fontWeight: 600 }}>{percent}%</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * Bar Chart for Monthly Expense Trends
 */
export function MonthlyTrendChart({ data = [] }) {
    const [hoveredIdx, setHoveredIdx] = useState(null);

    if (data.length === 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', color: 'var(--text-muted)' }}>
                <i className="ri-inbox-line" style={{ fontSize: '32px', marginBottom: '8px' }} />
                <span>No trend data available</span>
            </div>
        );
    }

    const chartHeight = 160;
    const chartWidth = 500;
    const paddingLeft = 50;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const svgWidth = chartWidth + paddingLeft + paddingRight;
    const svgHeight = chartHeight + paddingTop + paddingBottom;

    const maxVal = Math.max(...data.map(d => Math.max(Number(d.amount), Number(d.fuelCost || 0))), 100);
    // Round maxVal to nice increment
    const yMax = Math.ceil(maxVal / 100) * 100;

    const xStep = chartWidth / data.length;
    const barWidth = Math.max(xStep * 0.5, 10);

    return (
        <div style={{ width: '100%', position: 'relative' }}>
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto' }}>
                {/* Horizontal Gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                    const y = paddingTop + chartHeight * (1 - ratio);
                    const val = yMax * ratio;
                    return (
                        <g key={ratio}>
                            <line
                                x1={paddingLeft}
                                y1={y}
                                x2={paddingLeft + chartWidth}
                                y2={y}
                                stroke="var(--border-color)"
                                strokeWidth="1"
                                strokeDasharray="4 4"
                            />
                            <text
                                x={paddingLeft - 10}
                                y={y + 4}
                                fill="var(--text-muted)"
                                fontSize="10"
                                textAnchor="end"
                                fontWeight="500"
                            >
                                ${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                            </text>
                        </g>
                    );
                })}

                {/* X Axis line */}
                <line
                    x1={paddingLeft}
                    y1={paddingTop + chartHeight}
                    x2={paddingLeft + chartWidth}
                    y2={paddingTop + chartHeight}
                    stroke="var(--border-strong)"
                    strokeWidth="1.5"
                />

                {/* Bars */}
                {data.map((item, idx) => {
                    const x = paddingLeft + (idx * xStep) + (xStep / 2) - (barWidth / 2);
                    const height = (Number(item.amount) / yMax) * chartHeight;
                    const y = paddingTop + chartHeight - height;

                    const fuelHeight = ((Number(item.fuelCost || 0)) / yMax) * chartHeight;
                    const fuelY = paddingTop + chartHeight - fuelHeight;

                    return (
                        <g key={item.month}>
                            {/* Background interactive hover trigger */}
                            <rect
                                x={paddingLeft + (idx * xStep)}
                                y={paddingTop}
                                width={xStep}
                                height={chartHeight}
                                fill="transparent"
                                onMouseEnter={() => setHoveredIdx(idx)}
                                onMouseLeave={() => setHoveredIdx(null)}
                            />

                            {/* Total Cost Bar */}
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={height}
                                fill={hoveredIdx === idx ? 'var(--primary-hover)' : 'var(--primary)'}
                                rx="4"
                                className="svg-bar"
                            />

                            {/* Fuel Sub-Bar (Overlay) */}
                            {fuelHeight > 0 && (
                                <rect
                                    x={x}
                                    y={fuelY}
                                    width={barWidth}
                                    height={fuelHeight}
                                    fill="#9f6a90"
                                    rx="2"
                                    style={{ pointerEvents: 'none' }}
                                />
                            )}

                            {/* X-axis Label */}
                            <text
                                x={paddingLeft + (idx * xStep) + (xStep / 2)}
                                y={paddingTop + chartHeight + 18}
                                fill="var(--text-muted)"
                                fontSize="11"
                                textAnchor="middle"
                                fontWeight="500"
                            >
                                {item.month}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredIdx !== null && (
                <div
                    className="svg-tooltip"
                    style={{
                        top: '10px',
                        right: '10px',
                    }}
                >
                    <div style={{ textTransform: 'uppercase', fontSize: '9px', opacity: 0.8 }}>{data[hoveredIdx].month}</div>
                    <div style={{ marginTop: '2px' }}>Total Expense: <strong>${data[hoveredIdx].amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
                    {data[hoveredIdx].fuelCost > 0 && (
                        <div style={{ color: '#c89dbb' }}>Fuel Component: <strong>${data[hoveredIdx].fuelCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * Line Chart for Fuel Cost Trends
 */
export function FuelCostTrendChart({ data = [] }) {
    const [hoveredIdx, setHoveredIdx] = useState(null);

    if (data.length === 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', color: 'var(--text-muted)' }}>
                <i className="ri-inbox-line" style={{ fontSize: '32px', marginBottom: '8px' }} />
                <span>No fuel cost trend available</span>
            </div>
        );
    }

    const chartHeight = 160;
    const chartWidth = 500;
    const paddingLeft = 50;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const svgWidth = chartWidth + paddingLeft + paddingRight;
    const svgHeight = chartHeight + paddingTop + paddingBottom;

    const maxVal = Math.max(...data.map(d => Number(d.fuelCost || 0)), 100);
    const yMax = Math.ceil(maxVal / 100) * 100;

    const xStep = chartWidth / data.length;

    // Build path coordinates string
    const points = data.map((item, idx) => {
        const x = paddingLeft + (idx * xStep) + (xStep / 2);
        const y = paddingTop + chartHeight - ((Number(item.fuelCost || 0) / yMax) * chartHeight);
        return { x, y, val: Number(item.fuelCost || 0), month: item.month };
    });

    const pathData = points.length > 0
        ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
        : '';

    return (
        <div style={{ width: '100%', position: 'relative' }}>
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto' }}>
                {/* Horizontal Gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                    const y = paddingTop + chartHeight * (1 - ratio);
                    const val = yMax * ratio;
                    return (
                        <g key={ratio}>
                            <line
                                x1={paddingLeft}
                                y1={y}
                                x2={paddingLeft + chartWidth}
                                y2={y}
                                stroke="var(--border-color)"
                                strokeWidth="1"
                                strokeDasharray="4 4"
                            />
                            <text
                                x={paddingLeft - 10}
                                y={y + 4}
                                fill="var(--text-muted)"
                                fontSize="10"
                                textAnchor="end"
                                fontWeight="500"
                            >
                                ${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                            </text>
                        </g>
                    );
                })}

                {/* X Axis line */}
                <line
                    x1={paddingLeft}
                    y1={paddingTop + chartHeight}
                    x2={paddingLeft + chartWidth}
                    y2={paddingTop + chartHeight}
                    stroke="var(--border-strong)"
                    strokeWidth="1.5"
                />

                {/* Line Path */}
                {pathData && (
                    <path
                        d={pathData}
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )}

                {/* Interactive Points */}
                {points.map((p, idx) => {
                    return (
                        <g key={p.month}>
                            {/* Hover capture box */}
                            <rect
                                x={paddingLeft + (idx * xStep)}
                                y={paddingTop}
                                width={xStep}
                                height={chartHeight + 10}
                                fill="transparent"
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={() => setHoveredIdx(idx)}
                                onMouseLeave={() => setHoveredIdx(null)}
                            />

                            {/* Circle Dot */}
                            <circle
                                cx={p.x}
                                cy={p.y}
                                r={hoveredIdx === idx ? 6 : 4}
                                fill={hoveredIdx === idx ? 'var(--primary-hover)' : 'var(--primary)'}
                                stroke="var(--bg-card)"
                                strokeWidth="2"
                                style={{ transition: 'r 0.15s, fill 0.15s' }}
                            />

                            {/* X-axis Label */}
                            <text
                                x={p.x}
                                y={paddingTop + chartHeight + 18}
                                fill="var(--text-muted)"
                                fontSize="11"
                                textAnchor="middle"
                                fontWeight="500"
                            >
                                {p.month}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredIdx !== null && (
                <div
                    className="svg-tooltip"
                    style={{
                        top: '10px',
                        right: '10px',
                    }}
                >
                    <div style={{ textTransform: 'uppercase', fontSize: '9px', opacity: 0.8 }}>{points[hoveredIdx].month}</div>
                    <div style={{ marginTop: '2px' }}>Fuel Cost: <strong>${points[hoveredIdx].val.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
                </div>
            )}
        </div>
    );
}
