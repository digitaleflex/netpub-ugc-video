import React from 'react';

interface TableProps {
    headers: string[];
    children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ headers, children }) => {
    return (
        <div className="premium-table-container">
            <table className="premium-table">
                <thead>
                    <tr>
                        {headers.map((header, index) => (
                            <th key={index}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {children}
                </tbody>
            </table>
        </div>
    );
};

export const TableRow: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => (
    <tr className={onClick ? 'clickable-row' : ''} onClick={onClick}>
        {children}
    </tr>
);

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <td className={className}>{children}</td>
);
