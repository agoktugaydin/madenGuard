import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TunnelEditor.css";
import { apiUrl, apiPort } from "../../constants";

// Grid component to render the grid
const Grid = ({ rows, cols, nodes, vertices, addNode, addVertex, toggleNodeState, removeNode, removeVertex }) => {
  const [startNode, setStartNode] = useState(null);

  const handleClick = (event) => {
    const rect = event.target.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const row = Math.floor(mouseY / 50);
    const col = Math.floor(mouseX / 50);

    const clickedNode = nodes.find(node => node.row === row && node.col === col);

    if (clickedNode) {
      if (startNode && startNode.nodeId === clickedNode.nodeId) {
        toggleNodeState(clickedNode.nodeId);
        setStartNode(null);
      } else if (startNode) {
        addVertex(startNode.nodeId, clickedNode.nodeId);
        setStartNode(null);
      } else {
        setStartNode(clickedNode);
      }
    } else {
      addNode({ row, col });
      setStartNode(null);
    }
  };


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

  return (
    <div className="grid-container" style={{ width: cols * 50 + 2, height: rows * 50 + 2 }}>
      <svg
        width={cols * 50 + 2}
        height={rows * 50 + 2}
        onClick={handleClick}
        className="grid"
      >
        {drawLinesAndNodes()}
        {nodes.map((node, index) => (
          <circle
            key={`node${index}`}
            cx={node.col * 50}
            cy={node.row * 50}
            r={10}
            fill={getNodeColor(node)}
          />
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

const getNodeColor = (node) => {
  switch (node.attributes.active) {
    case "yes":
      return "green";
    case "no":
      return "red";
    default:
      return "black";
  }
};

const TunnelEditor = () => {
  const [nodes, setNodes] = useState([]);
  const [vertices, setVertices] = useState([]);

  useEffect(() => {
    const fetchTunnelData = async () => {
      try {
        const response = await axios.get(`${apiUrl}:${apiPort}/api/getTunnelData/1`);
        const processedData = processTunnelData(response.data); // Process received data
        setNodes(processedData.nodes);
        setVertices(processedData.vertices);
      } catch (error) {
        console.error("Error fetching tunnel data:", error);
      }
    };

    fetchTunnelData();
  }, []);

  const addNode = ({ row, col }) => {
    const newNode = {
      tunnelId: 1,
      nodeId: nodes.length + 1,
      row,
      col,
      attributes: { name: `Node ${nodes.length + 1}`, active: "yes" }
    };
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
  };

  const removeNode = (nodeId) => {
    const updatedNodes = nodes.filter(node => node.nodeId !== nodeId);
    setNodes(updatedNodes);

    const updatedVertices = vertices.filter(vertex => vertex.start !== nodeId && vertex.end !== nodeId);
    setVertices(updatedVertices);
  };

  const addVertex = (start, end) => {
    const newVertex = { start, end, tunnelId: 1 };
    const updatedVertices = [...vertices, newVertex];
    setVertices(updatedVertices);
  };

  const removeVertex = (index) => {
    const updatedVertices = vertices.filter((_, i) => i !== index);
    setVertices(updatedVertices);
  };

  const toggleNodeState = (nodeId) => {
    setNodes(nodes.map(node => {
      if (node.nodeId === nodeId) {
        return { ...node, attributes: { ...node.attributes, active: node.attributes.active === "yes" ? "no" : "yes" } };
      }
      return node;
    }));
  };


  const processTunnelData = (data) => {
    // Process received tunnel data
    // Remove unnecessary fields like _id, __v
    const processedNodes = data.nodes.map(({ _id, __v, ...rest }) => rest);
    const processedVertices = data.vertices.map(({ _id, __v, ...rest }) => rest);
    return { nodes: processedNodes, vertices: processedVertices };
  };

  const generateTunnelDataJSON = () => {
    const tunnelData = { nodes, vertices };
    return JSON.stringify(tunnelData);
  };

  const saveTunnelData = async () => {
    try {
      const tunnelData = generateTunnelDataJSON();
      await axios.post(`${apiUrl}:${apiPort}/api/saveTunnelData`, tunnelData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Tunnel data saved successfully');
    } catch (error) {
      console.error('Error saving tunnel data:', error);
    }
  };

  return (
    <div className="TunnelEditor">
      <div className="tunnel-buttons">
        <button onClick={saveTunnelData}>Save Tunnel</button>
      </div>
      <Grid
        rows={20}
        cols={20}
        nodes={nodes}
        vertices={vertices}
        addNode={addNode}
        addVertex={addVertex}
        toggleNodeState={toggleNodeState}
        removeNode={removeNode}
        removeVertex={removeVertex}
      />
    </div>
  );
};

export default TunnelEditor;
