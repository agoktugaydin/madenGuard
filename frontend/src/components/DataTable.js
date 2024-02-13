import React from 'react';
import Pagination from './Pagination';

const DataTable = ({ data, itemsPerPage }) => {
    const [currentPage, setCurrentPage] = React.useState(1);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>Device ID</th>
                        <th>Gas Intensity</th>
                        <th>Zone</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {data && Array.isArray(data) && data.map((entry) => (
                        <tr key={entry._id}>
                            <td>{entry.deviceId}</td>
                            <td>{entry.gasIntensity}</td>
                            <td>{entry.zone}</td>
                            <td>{new Date(entry.timestamp).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;


