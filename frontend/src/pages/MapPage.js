import React, { useState } from 'react';
import '../App.css';

const GridCell = ({ row, col, onClick, isPath, isSelected, onToggleSelect, isMainRoad, isSideRoad }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [deviceName, setDeviceName] = useState("");

    const handleClick = () => {
        onClick(row, col);
        setShowPopup(true);
        setDeviceName(`device${row}${col}`);
    };

    const handleToggleSelect = (event) => {
        event.stopPropagation();
        onToggleSelect(row, col);
        setShowPopup(false);
    };

    const getColorByStatus = () => {
        if (isMainRoad) return "#c2c2c2"; // Ana yol rengi
        if (isSideRoad) return "#aaa"; // Yan yol rengi
        if (deviceName.includes("connected")) return "#48dbfb"; // Blue
        if (deviceName.includes("active")) return "#1dd1a1"; // Green
        if (deviceName.includes("deactive")) return "#ff6b6b"; // Red
    };

    return (
        <div
            className={`grid-cell ${isPath ? 'path' : ''} ${isSelected ? 'selected' : ''}`}
            onClick={handleClick}
            style={{ backgroundColor: getColorByStatus() }}
        >
            {isSelected && (
                <div className="balloon" onClick={handleToggleSelect}>
                    <span className="nickname">{deviceName}</span>
                </div>
            )}
            {showPopup && (
                <div className="popup">
                    <p>{row}, {col}</p>
                </div>
            )}
        </div>
    );
};

const MapPage = () => {
    const [selectedCells, setSelectedCells] = useState([]);
    const [nicknameList, setNicknameList] = useState([]);

    const handleCellClick = (row, col) => {
        const newCell = { row, col };
        setSelectedCells([...selectedCells, newCell]);
        setNicknameList([...nicknameList, newCell]);
    };

    const handleToggleSelect = (row, col) => {
        setSelectedCells(selectedCells.filter(cell => !(cell.row === row && cell.col === col)));
        setNicknameList(nicknameList.filter(cell => !(cell.row === row && cell.col === col)));
    };

    return (
        <div className="map-page">
            <div className="map-container">
                <div className="grid">
                    {renderGrid(selectedCells, handleCellClick, handleToggleSelect)}
                </div>
            </div>
            <div className="sidebar">
                <h2>Selected Cells</h2>
                <ul className="selected-cells-list">
                    {nicknameList.map((cell, index) => (
                        <li key={index}>
                            <span className="nickname">{`device${cell.row}${cell.col}`}</span>
                            <span className="coordinates">{cell.row}, {cell.col}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const renderGrid = (selectedCells, onClick, onToggleSelect) => {
    const rows = 30; // Artırılan kare sayısı
    const cols = 20;
    const grid = [];

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            // Düz ana yol oluştur
            if (i < 20 && j === 9) {
                grid.push(
                    <GridCell
                        key={`${i}-${j}`}
                        row={i}
                        col={j}
                        onClick={onClick}
                        isPath={true}
                        isMainRoad={true}
                        isSelected={selectedCells.some(cell => cell.row === i && cell.col === j)}
                        onToggleSelect={onToggleSelect}
                    />
                );
            }
            // Belirli aralıklarla yan yolları aç
            else if ((i === 5 || i === 10 || i === 15 || i === 20 || i === 25) && (j >= 3 && j <= 6 || j >= 12 && j <= 15)) {
                grid.push(
                    <GridCell
                        key={`${i}-${j}`}
                        row={i}
                        col={j}
                        onClick={onClick}
                        isPath={true}
                        isSideRoad={true}
                        isSelected={selectedCells.some(cell => cell.row === i && cell.col === j)}
                        onToggleSelect={onToggleSelect}
                    />
                );
            }
            else {
                grid.push(
                    <GridCell
                        key={`${i}-${j}`}
                        row={i}
                        col={j}
                        onClick={onClick}
                        isPath={false}
                        isSelected={selectedCells.some(cell => cell.row === i && cell.col === j)}
                        onToggleSelect={onToggleSelect}
                    />
                );
            }
        }
    }

    return grid;
};

export default MapPage;
