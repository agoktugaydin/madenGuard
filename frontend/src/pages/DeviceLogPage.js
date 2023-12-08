// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DeviceSelect from '../components/DeviceSelect';
import DataTable from '../components/DataTable';

const HomePage = () => {
    const [deviceIds, setDeviceIds] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const [data, setData] = useState([]);

    const fetchDeviceIds = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/deviceIds');
            setDeviceIds(response.data);
        } catch (error) {
            console.error('Error fetching device IDs:', error);
        }
    };

    const fetchData = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/data?deviceId=${selectedDeviceId}&timeRange=120`);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchDeviceIds();

        if (selectedDeviceId) {
            fetchData();
            const intervalId = setInterval(() => {
                fetchData();
            }, 2000);

            return () => {
                clearInterval(intervalId);
            };
        }
    }, [selectedDeviceId]);

    return (
        <div className="app-container">
            <h1>MadenGuard</h1>
            <DeviceSelect deviceIds={deviceIds} selectedDeviceId={selectedDeviceId} onChange={setSelectedDeviceId} />
            <DataTable data={data} />
        </div>
    );
};

export default HomePage;
