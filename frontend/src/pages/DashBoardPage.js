/* DashboardPage.js */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DeviceList from '../components/DeviceList';
import DataChart from '../components/DataChart';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css'; // Import the CSS file
const { apiUrl, apiPort } = require('../constants.js');

const DashboardPage = ({ isLoggedIn }) => {
    const [deviceIds, setDeviceIds] = useState([]);
    const [selectedDeviceIds, setSelectedDeviceIds] = useState([]);
    const [data, setData] = useState({});
    const [itemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchDeviceIds = async () => {
            try {
                const response = await axios.get(`${apiUrl}:${apiPort}/api/deviceIds`);
                setDeviceIds(response.data);
            } catch (error) {
                console.error('Error fetching device IDs:', error);
            }
        };

        fetchDeviceIds();
    }, []);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
        }
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        const fetchData = async (deviceId) => {
            try {
                const response = await axios.get(`${apiUrl}:${apiPort}/api/data?deviceId=${deviceId}&timeRange=120`);
                const totalItems = response.data.length;
                setTotalPages(Math.ceil(totalItems / itemsPerPage));

                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const slicedData = response.data.reverse().slice(startIndex, endIndex);

                setData((prevData) => ({
                    ...prevData,
                    [deviceId]: response.data.reverse(),
                }));
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        selectedDeviceIds.forEach((deviceId) => fetchData(deviceId));

        const intervalId = setInterval(() => {
            selectedDeviceIds.forEach((deviceId) => fetchData(deviceId));
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [selectedDeviceIds, currentPage]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleDeviceSelect = (deviceId) => {
        setSelectedDeviceIds((prevSelectedDevices) => {
            if (prevSelectedDevices.includes(deviceId)) {
                return prevSelectedDevices.filter((id) => id !== deviceId);
            } else {
                return [...prevSelectedDevices, deviceId];
            }
        });
    };


    return (
        <div className="dashboard-container">
            <header>
                <h1>MadenGuard Dashboard</h1>
            </header>
            <div className="dashboard-content">
                <section className="device-list-section">
                    <h2>Select Devices:</h2>
                    <DeviceList deviceIds={deviceIds} selectedDeviceIds={selectedDeviceIds} onDeviceSelect={handleDeviceSelect} />
                </section>
                <section className="device-charts-section">
                    {selectedDeviceIds.length === 0 ? (
                        <div className="empty-state-message">Select devices to display charts</div>
                    ) : (
                        <>
                            <div className="device-column">
                                {selectedDeviceIds.slice(0, Math.ceil(selectedDeviceIds.length / 2)).map((deviceId) => (
                                    <div key={deviceId} className="device-chart">
                                        <h2>{deviceId}</h2>
                                        <DataChart data={data[deviceId] || []} deviceId={deviceId} />
                                    </div>
                                ))}
                            </div>
                            <div className="device-column">
                                {selectedDeviceIds.slice(Math.ceil(selectedDeviceIds.length / 2)).map((deviceId) => (
                                    <div key={deviceId} className="device-chart">
                                        <h2>{deviceId}</h2>
                                        <DataChart data={data[deviceId] || []} deviceId={deviceId} />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
};

export default DashboardPage;