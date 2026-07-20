import React from 'react';

interface VirtualizedInsightListProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    className?: string;
}

/**
 * Lightweight virtualization using CSS content-visibility
 * No external dependencies - uses native browser optimization
 */
export function VirtualizedInsightList<T>({
    items,
    renderItem,
    className = ''
}: VirtualizedInsightListProps<T>) {
    return (
        <div className={className}>
            {items.map((item, index) => (
                <div
                    key={index}
                    style={{
                        contentVisibility: 'auto',
                        containIntrinsicSize: '0 200px', // Estimated height for offscreen items
                    }}
                >
                    {renderItem(item, index)}
                </div>
            ))}
        </div>
    );
}
