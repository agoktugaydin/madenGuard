import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // CSS dosyasını import et

const App = () => {
  const [deviceIds, setDeviceIds] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [data, setData] = useState([]);

  // Cihaz ID'lerini çeken fonksiyon
  const fetchDeviceIds = async () => {
    try {
      // HTTP GET isteği ile cihaz ID'lerini çek
      const response = await axios.get('http://localhost:3001/api/deviceIds');

      // Gelen cihaz ID'lerini state'e ekleyerek güncelleme
      setDeviceIds(response.data);
    } catch (error) {
      console.error('Error fetching device IDs:', error);
    }
  };

  // Belirli cihaz ID'sine ait verileri çeken fonksiyon
  const fetchData = async () => {
    try {
      // HTTP GET isteği ile belirli cihaz ID'sine ait verileri çek (son 30 saniye)
      const response = await axios.get(`http://localhost:3001/api/data?deviceId=${selectedDeviceId}&timeRange=120`);

      // Gelen veriyi state'e ekleyerek güncelleme
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    // Component ilk render olduğunda cihaz ID'lerini çek
    fetchDeviceIds();

    // Eğer seçili cihaz ID varsa fetchData fonksiyonunu belirli aralıklarla çağırarak veriyi kontrol et
    if (selectedDeviceId) {
      fetchData();
      const intervalId = setInterval(() => {
        fetchData();
      }, 2000);

      // ComponentWillUnmount
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [selectedDeviceId]);

  return (
    <div className="app-container">
      <h1>Real-time Data Visualization with React</h1>

      {/* Cihaz ID'lerini gösteren bir dropdown */}
      <label htmlFor="deviceSelect">Select Device ID:</label>
      <select
        id="deviceSelect"
        value={selectedDeviceId}
        onChange={(e) => setSelectedDeviceId(e.target.value)}
      >
        <option value="">Select Device ID</option>
        {deviceIds.map((deviceId) => (
          <option key={deviceId} value={deviceId}>
            {deviceId}
          </option>
        ))}
      </select>

      {/* Veri tablosu */}
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
    </div>
  );
};

export default App;
