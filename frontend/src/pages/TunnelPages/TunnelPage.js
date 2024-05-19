import React, { useState, useEffect } from "react";
import "./Grid.css";
import nodesDataJson from "../TunnelData/nodes.json";
import verticesDataJson from "../TunnelData/vertices.json";
import selectedCellsJson from "../TunnelData/selectedCells.json";
import { apiUrl, apiPort } from "../../constants";

const Grid = ({ rows, cols, nodes, vertices, selectedCells, showGrid }) => {
  const drawGridLines = () => {
    const elements = [];

    if (showGrid) {
      // Draw horizontal lines
      for (let i = 0; i <= rows; i++) {
        elements.push(
          <line
            key={`h${i}`}
            className="grid-line"
            x1="0"
            y1={i * 50}
            x2={cols * 50}
            y2={i * 50}
          />
        );
      }

      // Draw vertical lines
      for (let j = 0; j <= cols; j++) {
        elements.push(
          <line
            key={`v${j}`}
            className="grid-line"
            x1={j * 50}
            y1="0"
            x2={j * 50}
            y2={rows * 50}
          />
        );
      }
    }

    // Draw thicker border lines for top, left, right, and bottom
    elements.push(
      <line
        key="borderTop"
        className="border-line"
        x1="0"
        y1="0"
        x2={cols * 50}
        y2="0"
      />
    );
    elements.push(
      <line
        key="borderLeft"
        className="border-line"
        x1="0"
        y1="0"
        x2="0"
        y2={rows * 50}
      />
    );
    elements.push(
      <line
        key="borderRight"
        className="border-line"
        x1={cols * 50}
        y1="0"
        x2={cols * 50}
        y2={rows * 50}
      />
    );
    elements.push(
      <line
        key="borderBottom"
        className="border-line"
        x1="0"
        y1={rows * 50}
        x2={cols * 50}
        y2={rows * 50}
      />
    );

    return elements;
  };

  // Function to draw the selected cells
  const drawSelectedCells = () => {
    return selectedCells.map((cell) => {
      const cellX = cell.col * 50;
      const cellY = cell.row * 50;
      return (
        <rect
          key={`selectedCell${cell.id}`}
          x={cellX}
          y={cellY}
          width={50}
          height={50}
          fill="gray" // Set selected cell color
          opacity={0.5} // Set opacity for visibility
        />
      );
    });
  };

  // Function to draw the nodes and vertices
  const drawNodesAndVertices = () => {
    const elements = [];

    // Draw nodes
    nodes.forEach((node) => {
      const nodeX = node.col * 50;
      const nodeY = node.row * 50;
      const nodeColor =
        node.attributes.active === "true"
          ? "green"
          : node.attributes.active === "false"
            ? "red"
            : "black"; // Determine node color based on active property
      elements.push(
        <circle
          key={`node${node.id}`}
          cx={nodeX}
          cy={nodeY}
          r={10}
          fill={nodeColor} // Set node color
        />
      );
    });

    // Draw vertices
    vertices.forEach((vertex) => {
      const start = vertex[0];
      const end = vertex[1];
      const startX = nodes[start].col * 50;
      const startY = nodes[start].row * 50;
      const endX = nodes[end].col * 50;
      const endY = nodes[end].row * 50;
      elements.push(
        <line
          key={`vertex${start}${end}`}
          className="vertex-line"
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
        />
      );
    });

    return elements;
  };

  return (
    <svg width={cols * 50 + 2} height={rows * 50 + 2}>
      {drawGridLines()}
      {drawSelectedCells()}
      {drawNodesAndVertices()}
    </svg>
  );
};

// Function to get the maximum row and column values
const getMaxRowColValues = (nodes) => {
  let maxRow = 0;
  let maxCol = 0;

  nodes.forEach((node) => {
    if (node.row > maxRow) {
      maxRow = node.row;
    }
    if (node.col > maxCol) {
      maxCol = node.col;
    }
  });

  return { maxRow, maxCol };
};

// App component
const TunnelPage = () => {
  const [loading, setLoading] = useState(true);
  const [nodesData, setNodesData] = useState([]);
  const [verticesData, setVerticesData] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [showGrid, setShowGrid] = useState(true);

  // Fetch tunnel data from the backend
  useEffect(() => {
    const fetchTunnelData = async () => {
      try {
        const tunnelId = "-1"; // "1"; // FOR NOW
        const response = await fetch(`${apiUrl}:${apiPort}/api/getTunnelData/${tunnelId}`);
        const data = await response.json();
        console.log("getTunnelIdhData", data.nodes, data.vertices);
        setNodesData(data.nodes);
        setVerticesData(data.vertices);
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error("Error fetching tunnel data:", error);
        setLoading(false); // Set loading to false if there's an error
      }
    };

    // use json files:
    setNodesData(nodesDataJson);
    setVerticesData(verticesDataJson);
    setSelectedCells(selectedCellsJson); // Set selected cells data
    setLoading(false);

    //fetchTunnelData(); // commented to use json files
  }, []);

  const maxValues = getMaxRowColValues(nodesData);
  const gridRows = maxValues.maxRow + 1; // Number of rows
  const gridCols = maxValues.maxCol + 1; // Number of columns

  // Render loading state if data is still being fetched
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="TunnelPage">
      <div className="toggle-button">
        {/* <button onClick={() => setShowGrid(!showGrid)}>
          {showGrid ? "Hide Grid" : "Show Grid"}
        </button> */}
      </div>
      <div className="grid-container-2">
        <Grid
          rows={gridRows}
          cols={gridCols}
          nodes={nodesData}
          vertices={verticesData}
          selectedCells={selectedCells} // Pass selected cells data
          showGrid={showGrid}
        />
      </div>
      {/* Render nodes and vertices */}
    </div>
  );
};

export default TunnelPage;
