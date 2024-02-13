// DataChart.js
import { Chart as ChartJS } from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './DataChart.css';

const DataChart = ({ data, deviceId }) => {
    const gasIntensityValues = data.map((entry) => entry.gasIntensity);
    const timestamps = data.map((entry) =>
        new Date(entry.timestamp).toLocaleString()
    );
    const [isPaused, setIsPaused] = useState(false);

    const handlePauseResumeClick = () => {
        setIsPaused(!isPaused);
    };

    const handleScreenshotClick = () => {
        const chart = document.getElementById(`chart-${deviceId}`); // Use device-specific ID

        // Check if the chart is found
        if (!chart) {
            console.error('Chart not found');
            return;
        }

        // Yeni bir canvas oluştur
        const tempCanvas = document.createElement('canvas');
        const tempContext = tempCanvas.getContext('2d');
        tempCanvas.width = chart.width;
        tempCanvas.height = chart.height;

        // Beyaz arkaplanı çizin
        tempContext.fillStyle = 'white';
        tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Mevcut grafik içeriğini yeni canvas'a çizin
        tempContext.drawImage(chart, 0, 0);

        // Yeni canvas'tan ekran görüntüsü alın
        const screenshotUrl = tempCanvas.toDataURL('image/jpeg');

        // Cihaz ID'si ve zaman bilgisine göre isim oluştur
        const timestamp = new Date().toISOString().replace(/[\-\:\.]/g, '');
        const screenshotName = `screenshot_${deviceId}_${timestamp}.jpg`;

        // Snackbar gösterme
        toast.success('Screenshot taken successfully!', {
            position: 'bottom-right',
            autoClose: 3000,
        });

        // Ekran görüntüsünü bilgisayarınıza indirme
        const link = document.createElement('a');
        link.href = screenshotUrl;
        link.download = screenshotName;
        link.click();
    };

    const chartData = {
        labels: timestamps,
        datasets: [
            {
                label: 'Gas Intensity',
                data: gasIntensityValues,
                fill: false,
                borderColor: 'black',
                lineTension: 0.4,
                backgroundColor: (ctx) => {
                    const value = ctx.dataset.data[ctx.dataIndex];
                    if (value >= 70) {
                        return 'red';
                    } else if (value >= 50) {
                        return 'orange';
                    } else if (value >= 30) {
                        return 'yellow';
                    } else {
                        return 'green';
                    }
                },
            },
        ],
    };

    const chartOptions = {
        scales: {
            y: {
                max: 100,
            },
        },
        animation: {
            duration: 0, // Animasyon süresini 0 olarak ayarla (kapatır)
        },
    };

    return (
        <div className="chart-container">
            <div className="screenshot-button-container">
                <button onClick={handleScreenshotClick}>Take Screenshot</button>
            </div>
            <Line id={`chart-${deviceId}`} data={chartData} options={chartOptions} />
            <ToastContainer />
        </div>
    );
};

export default DataChart;
