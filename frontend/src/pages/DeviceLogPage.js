import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DeviceSelect from '../components/DeviceSelect';
import { useNavigate } from 'react-router-dom';
import DataChart from '../components/DataChart';
import '../styles.css';
import { apiUrl, apiPort } from '../constants';

const DeviceLogPage = ({ isLoggedIn }) => {
    const [deviceIds, setDeviceIds] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const [data, setData] = useState([]);
    const [itemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
        }
    }, [isLoggedIn, navigate]);

    const fetchDeviceIds = async () => {
        try {
            const response = await axios.get(`${apiUrl}:${apiPort}/api/deviceIds`);
            setDeviceIds(response.data);
        } catch (error) {
            console.error('Error fetching device IDs:', error);
        }
    };

    const fetchData = async (pageNumber) => {
        try {
            const response = await axios.get(`${apiUrl}:${apiPort}/api/data?deviceId=${selectedDeviceId}&timeRange=120`);
            const totalItems = response.data.length;
            setTotalPages(Math.ceil(totalItems / itemsPerPage));

            const startIndex = (pageNumber - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const slicedData = response.data.reverse().slice(startIndex, endIndex);

            setData(response.data.reverse());

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchDeviceIds();

        if (selectedDeviceId) {
            fetchData(currentPage);
            const intervalId = setInterval(() => {
                fetchData(currentPage);
            }, 2000);

            return () => {
                clearInterval(intervalId);
            };
        }
    }, [selectedDeviceId, currentPage]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        fetchData(pageNumber);
    };

    return (
        <div className="app-container">
            <h1>MadenGuard</h1>
            <DeviceSelect deviceIds={deviceIds} selectedDeviceId={selectedDeviceId} onChange={setSelectedDeviceId} />
            <DataChart data={data} />
            {/* <DataTable data={data} itemsPerPage={itemsPerPage} /> */}
            {/* <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} /> */}
        </div>
    );
};

export default DeviceLogPage;
