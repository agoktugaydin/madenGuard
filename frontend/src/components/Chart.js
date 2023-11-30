import React, { useEffect } from 'react';
import Chart from 'chart.js/auto';

const ChartComponent = ({ data }) => {
    useEffect(() => {
        const ctx = document.getElementById('myChart').getContext('2d');
        const myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map((_, index) => index + 1),
                datasets: [{
                    label: 'Real-time Data',
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: false,
                }],
            },
        });

        // ComponentWillUnmount
        return () => {
            myChart.destroy();
        };
    }, [data]);

    return <canvas id="myChart" width="400" height="200"></canvas>;
};

export default ChartComponent;
