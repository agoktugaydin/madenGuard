import React, { useState, useEffect } from "react";
import axios from 'axios';
import "./Grid.css";
import nodesDataJson from "../TunnelData/nodes.json";
import verticesDataJson from "../TunnelData/vertices.json";
import { apiUrl, apiPort } from "../../constants";
import "./TunnelCreator.css";

const Grid = ({ rows, cols, nodes, vertices, showGrid, onCellClick, selectedCells }) => {
    const drawLinesAndNodes = () => {
        const elements = [];
        if (showGrid) {
            for (let i = 0; i <= rows; i++) {
                elements.push(
                    <line key={`h${i}`} className="grid-line" x1="0" y1={i * 50} x2={cols * 50} y2={i * 50} />
                );
            }
            for (let j = 0; j <= cols; j++) {
                elements.push(
                    <line key={`v${j}`} className="grid-line" x1={j * 50} y1="0" x2={j * 50} y2={rows * 50} />
                );
            }
        }
        elements.push(
            <line key="borderTop" className="border-line" x1="0" y1="0" x2={cols * 50} y2="0" />
        );
        elements.push(
            <line key="borderLeft" className="border-line" x1="0" y1="0" x2="0" y2={rows * 50} />
        );
        elements.push(
            <line key="borderRight" className="border-line" x1={cols * 50} y1="0" x2={cols * 50} y2={rows * 50} />
        );
        elements.push(
            <line key="borderBottom" className="border-line" x1="0" y1={rows * 50} x2={cols * 50} y2={rows * 50} />
        );

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const isSelected = selectedCells?.some(cell => cell.row === i && cell.col === j);
                const fillColor = isSelected ? "gray" : "white";
                elements.push(
                    <rect
                        key={`cell-${i}-${j}`}
                        x={j * 50}
                        y={i * 50}
                        width={50}
                        height={50}
                        fill={fillColor}
                        stroke="gray"
                        onClick={() => onCellClick(i, j)}
                    />
                );
            }
        }

        nodes.forEach((node) => {
            const nodeX = node.col * 50;
            const nodeY = node.row * 50;
            const nodeColor = node.attributes.active === "true" ? "green" : node.attributes.active === "false" ? "red" : "black";
            elements.push(<circle key={`node${node.id}`} cx={nodeX} cy={nodeY} r={10} fill={nodeColor} />);
        });

        vertices.forEach((row, i) => {
            const start = row[0];
            const end = row[1];
            const startX = nodes[start].col * 50;
            const startY = nodes[start].row * 50;
            const endX = nodes[end].col * 50;
            const endY = nodes[end].row * 50;
            elements.push(
                <line key={`vertex${start}${end}`} className="vertex-line" x1={startX} y1={startY} x2={endX} y2={endY} />
            );
        });

        return elements;
    };

    return <svg width={cols * 50 + 2} height={rows * 50 + 2}>{drawLinesAndNodes()}</svg>;
};

const getMaxRowColValues = (nodes) => {
    let maxRow = 0;
    let maxCol = 0;
    nodes.forEach((node) => {
        if (node.row > maxRow) maxRow = node.row;
        if (node.col > maxCol) maxCol = node.col;
    });
    return { maxRow, maxCol };
};

const TunnelCreator = () => {
    const [loading, setLoading] = useState(true);
    const [nodesData, setNodesData] = useState([]);
    const [verticesData, setVerticesData] = useState([]);
    const [selectedCells, setSelectedCells] = useState([]);
    const [tunnelId, setTunnelId] = useState(null);

    useEffect(() => {
        setNodesData(nodesDataJson);
        setVerticesData(verticesDataJson);
        setLoading(false);
    }, []);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            setSelectedCells(JSON.parse(content));
        };
        reader.readAsText(file);
    };

    const exportSelectedCells = () => {
        const selectedCellsJson = JSON.stringify(selectedCells, null, 2);
        const blob = new Blob([selectedCellsJson], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "selectedCells.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const saveCorridorToDatabase = async () => {
        try {
            const data = { tunnelId, cells: selectedCells };
            console.log('Saving corridor:', data); // Log the data to be sent
            const response = await axios.post(`${apiUrl}:${apiPort}/api/corridor/${tunnelId}`, data);
            console.log('Corridor saved:', response.data);
        } catch (error) {
            console.error('Error saving corridor:', error);
        }
    };

    const loadCorridorFromDatabase = async () => {
        try {
            const response = await axios.get(`${apiUrl}:${apiPort}/api/corridor/${tunnelId}`);
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                const corridorData = response.data[0].cells.map(cell => ({ row: cell.row, col: cell.col }));
                setSelectedCells(corridorData);
            } else {
                console.error('Invalid corridor data:', response.data);
            }
        } catch (error) {
            console.error('Error loading corridor:', error);
        }
    };

    const maxValues = getMaxRowColValues(nodesData);
    const gridRows = maxValues.maxRow + 1;
    const gridCols = maxValues.maxCol + 1;

    const handleCellClick = (row, col) => {
        const cellIndex = selectedCells.findIndex(cell => cell.row === row && cell.col === col);
        if (cellIndex === -1) {
            setSelectedCells([...selectedCells, { row, col }]);
        } else {
            const newSelectedCells = selectedCells.slice();
            newSelectedCells.splice(cellIndex, 1);
            setSelectedCells(newSelectedCells);
        }
    };

    const handleTunnelIdChange = (event) => {
        setTunnelId(event.target.value);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="TunnelCreator">
            <div className="tunnel-buttons">
                <input type="file" accept=".json" onChange={handleFileUpload} />
                <button onClick={exportSelectedCells}>Export Selected Cells</button>
                <input
                    type="number"
                    placeholder="Enter Tunnel ID"
                    value={tunnelId}
                    onChange={handleTunnelIdChange}
                    className="input-box"
                />
                <button onClick={saveCorridorToDatabase}>Save Corridor</button>
                <button onClick={loadCorridorFromDatabase}>Load Corridors</button>
            </div>
            <div className="grid-container-2">
                <Grid
                    rows={gridRows}
                    cols={gridCols}
                    nodes={nodesData}
                    vertices={verticesData}
                    showGrid={true}
                    onCellClick={handleCellClick}
                    selectedCells={selectedCells}
                />
            </div>
        </div>
    );
};

export default TunnelCreator;
