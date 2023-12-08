// src/components/DataTable.js
import React from 'react';

const DataTable = ({ data }) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>Device ID</th>
                    <th>Gas Intensity</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Timestamp</th>
                </tr>
            </thead>
            <tbody>
                {data && Array.isArray(data) && data.map((entry) => (
                    <tr key={entry._id}>
                        <td>{entry.deviceId}</td>
                        <td>{entry.gasIntensity}</td>
                        <td>{entry.location.coordinates[1]}</td>
                        <td>{entry.location.coordinates[0]}</td>
                        <td>{new Date(entry.timestamp).toLocaleString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default DataTable;
