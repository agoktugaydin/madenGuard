import React, { useEffect, useState } from 'react';
import Chart from './components/Chart';
import io from 'socket.io-client';

const socket = io('http://localhost:3001'); // WebSocket sunucusu adresi

const App = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // WebSocket üzerinden veri alındığında
    socket.on('dataUpdate', (message) => {
      console.log(`Received message from WebSocket server: ${message}`);

      // Gelen veriyi state'e ekleyerek güncelleme
      setData((prevData) => [...prevData, message]);
    });

    // ComponentWillUnmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Real-time Data Visualization with React</h1>
      <Chart data={data} />
    </div>
  );
};

export default App;
