import React from 'react';

const PDFReportPreview: React.FC<{ reportData: any }> = ({ reportData }) => {
    return (
        <div>
            <h2>PDF Report Preview</h2>
            {reportData ? (
                <div>
                    <h3>Report Summary</h3>
                    <p>{reportData.summary}</p>
                    <h3>Details</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Variable</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.details.map((detail: any, index: number) => (
                                <tr key={index}>
                                    <td>{detail.variable}</td>
                                    <td>{detail.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>No report data available.</p>
            )}
        </div>
    );
};

export default PDFReportPreview;