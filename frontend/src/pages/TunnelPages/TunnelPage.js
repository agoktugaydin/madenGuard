import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TunnelEditor.css";
import { apiUrl, apiPort } from "../../constants";
import "./Grid.css";

const Grid = ({ rows, cols, nodes, vertices, corridors }) => {
  const drawLinesAndNodes = () => {
    const elements = [];
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
    return elements;
  };

  const drawCorridors = () => {
    const elements = [];
    corridors.forEach(corridor => {
      corridor.cells.forEach(cell => {
        const fill = getNodeFill(cell);
        elements.push(
          <rect
            key={`${cell.row}-${cell.col}`}
            x={cell.col * 50}
            y={cell.row * 50}
            width={50}
            height={50}
            fill={fill}
          />
        );
      });
    });
    return elements;
  };

  const getNodeFill = (cell) => {
    return "grey"; // Fill all cells with grey color
  };

  const getNodeColor = (node) => {
    switch (node.attributes.status) {
      case "active":
        return "green";
      case "deactive":
        return "red";
      default:
        return "black";
    }
  };

  return (
    <div className="grid-container" style={{ width: cols * 50 + 2, height: rows * 50 + 2 }}>
      <svg
        width={cols * 50 + 2}
        height={rows * 50 + 2}
        className="grid"
      >
        {drawLinesAndNodes()}
        {drawCorridors()}
        {nodes.map((node, index) => (
          <g key={`node${index}`}>
            <circle
              cx={node.col * 50}
              cy={node.row * 50}
              r={10}
              fill={getNodeColor(node)}
            />
            {node.gasData && (
              <text
                x={node.col * 50}
                y={node.row * 50}
                dy={-15}
                textAnchor="middle"
                fill="black"
                fontSize="10"
              >
                {node.gasData.length > 0 ? `${node.gasData[node.gasData.length - 1].gasIntensity}%` : 'No Data'}
              </text>
            )}
          </g>
        ))}
        {vertices.map((vertex, index) => {
          const startNode = nodes.find(n => n.nodeId === vertex.start);
          const endNode = nodes.find(n => n.nodeId === vertex.end);

          if (!startNode || !endNode) {
            console.error(`Vertex ${index} has undefined start or end node`);
            return null; // Skip rendering this vertex if start or end node is undefined
          }

          return (
            <line
              key={`vertex${index}`}
              className="vertex-line"
              x1={startNode.col * 50}
              y1={startNode.row * 50}
              x2={endNode.col * 50}
              y2={endNode.row * 50}
            />
          );
        })}
      </svg>
    </div>
  );
};

const TunnelPage = () => {
  const [nodes, setNodes] = useState([]);
  const [vertices, setVertices] = useState([]);
  const [corridors, setCorridors] = useState([]);

  useEffect(() => {
    const fetchGasData = async (deviceId) => {
      try {
        const response = await axios.get(`${apiUrl}:${apiPort}/api/data`, {
          params: { deviceId, timeRange: 2 }
        });
        return response.data;
      } catch (error) {
        console.error(`Error fetching gas data for device ${deviceId}:`, error);
        return [];
      }
    };

    const updateGasData = async (nodes) => {
      console.log("Updating gas data for nodes..."); // Log to ensure the function is being called
      const updatedNodes = await Promise.all(nodes.map(async (node) => {
        const gasData = await fetchGasData(node.deviceId);
        return { ...node, gasData };
      }));
      setNodes(updatedNodes);
    };

    const fetchData = async () => {
      try {
        const tunnelResponse = await axios.get(`${apiUrl}:${apiPort}/api/getTunnelData/1`);
        const processedTunnelData = processTunnelData(tunnelResponse.data);
        setNodes(processedTunnelData.nodes);
        setVertices(processedTunnelData.vertices);
        setCorridors(tunnelResponse.data.corridor);

        // Start periodic updates for gas data
        const intervalId = setInterval(() => updateGasData(processedTunnelData.nodes), 2000);
        return () => clearInterval(intervalId); // Cleanup interval on component unmount
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData(); // Initial data fetch
  }, []); // Empty dependency array ensures this runs only once on mount

  const processTunnelData = (data) => {
    const processedNodes = data.nodes.map(({ _id, __v, ...rest }) => rest);
    const processedVertices = data.vertices.map(({ _id, __v, ...rest }) => rest);
    return { nodes: processedNodes, vertices: processedVertices };
  };

  return (
    <div className="TunnelEditor">
      <Grid
        rows={20}
        cols={20}
        nodes={nodes}
        vertices={vertices}
        corridors={corridors}
      />
    </div>
  );
};

export default TunnelPage;
