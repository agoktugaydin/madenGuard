import React, { useState } from "react";
import "./Grid.css"; // Add CSS file for styling if needed

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
        addVertex(startNode.nodeId - 1, clickedNode.nodeId - 1);
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

  const getNodeColor = (node) => {
    switch (node.attributes.active) {
      case "true":
        return "green";
      case "false":
        return "red";
      case "none":
        return "black";
      default:
        return "black";
    }
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
        {vertices.map(({ start, end }, index) => (
          <line
            key={`vertex${index}`}
            className="vertex-line"
            x1={nodes[start].col * 50}
            y1={nodes[start].row * 50}
            x2={nodes[end].col * 50}
            y2={nodes[end].row * 50}
          />
        ))}
      </svg>
    </div>
  );
};

export default Grid;




// import React, { useState } from "react";
// import "./Grid.css"; // Add CSS file for styling if needed

// const Grid = ({
//   rows,
//   cols,
//   nodes,
//   vertices,
//   addNode,
//   addVertex,
//   toggleNodeState,
//   removeNode,
//   removeVertex,
//   selectedCells // Add selectedCells as a prop
// }) => {
//   // State to keep track of the starting node for creating a new vertex
//   const [startNode, setStartNode] = useState(null);

//   // Function to handle click event on grid
//   const handleClick = (event) => {
//     const rect = event.target.getBoundingClientRect();
//     const mouseX = event.clientX - rect.left;
//     const mouseY = event.clientY - rect.top;

//     // Calculate row and column based on click position
//     const row = Math.floor(mouseY / 50);
//     const col = Math.floor(mouseX / 50);

//     // Check if there's a node at the clicked position
//     const clickedNode = nodes.find(node => node.row === row && node.col === col);

//     if (clickedNode) {
//       // If the same node is clicked again, toggle its state
//       if (startNode && startNode.nodeId === clickedNode.nodeId) {
//         toggleNodeState(clickedNode.nodeId);
//         setStartNode(null);
//       } else if (startNode) {
//         // If there's already a start node, add vertex between start node and clicked node
//         addVertex(startNode.nodeId - 1, clickedNode.nodeId - 1);
//         setStartNode(null); // Reset start node
//       } else {
//         // Set clicked node as the start node
//         setStartNode(clickedNode);
//       }
//     } else {
//       // If no node exists at the clicked position, add a new node
//       addNode({ row, col });
//       setStartNode(null);
//     }
//   };

//   // Function to draw the lines and nodes
//   const drawLinesAndNodes = () => {
//     const elements = [];

//     // Draw selected cells
//     selectedCells.forEach((cell, index) => {
//       elements.push(
//         <rect
//           key={`selectedCell${index}`}
//           x={cell.col * 50}
//           y={cell.row * 50}
//           width={50}
//           height={50}
//           fill="gray"
//           opacity={0.5}
//         />
//       );
//     });
    
//     // Draw horizontal and vertical grid lines
//     for (let i = 0; i <= rows; i++) {
//       elements.push(
//         <line
//           key={`h${i}`}
//           className="grid-line"
//           x1="0"
//           y1={i * 50}
//           x2={cols * 50}
//           y2={i * 50}
//         />
//       );
//     }
//     for (let j = 0; j <= cols; j++) {
//       elements.push(
//         <line
//           key={`v${j}`}
//           className="grid-line"
//           x1={j * 50}
//           y1="0"
//           x2={j * 50}
//           y2={rows * 50}
//         />
//       );
//     }

//     // Draw nodes
//     nodes.forEach((node, index) => {
//       elements.push(
//         <circle
//           key={`node${index}`}
//           cx={node.col * 50}
//           cy={node.row * 50}
//           r={10}
//           fill={getNodeColor(node)}
//         />
//       );
//     });

//     // Draw vertices
//     vertices.forEach(([start, end], index) => {
//       elements.push(
//         <line
//           key={`vertex${index}`}
//           className="vertex-line"
//           x1={nodes[start].col * 50}
//           y1={nodes[start].row * 50}
//           x2={nodes[end].col * 50}
//           y2={nodes[end].row * 50}
//         />
//       );
//     });



//     return elements;
//   };

//   return (
//     <div className="grid-container">
//       <div className="nodes-container">
//         <h2>Nodes</h2>
//         <ul>
//           {nodes.map((node) => (
//             <li key={`node${node.nodeId}`}>
//               {`Node ${node.nodeId}: (${node.row}, ${node.col})`}
//               <button onClick={() => removeNode(node.nodeId)}>❌</button>
//             </li>
//           ))}
//         </ul>
//       </div>
//       <svg
//         width={cols * 50 + 2}
//         height={rows * 50 + 2}
//         onClick={handleClick}
//         className="grid"
//       >
//         {/* Render grid lines, nodes, vertices, and selected cells */}
//         {drawLinesAndNodes()}
//       </svg>
//       <div className="connections-container">
//         <h2>Connections</h2>
//         <ul>
//           {vertices.map(([start, end], index) => (
//             <li key={`vertex${index}`}>
//               {`Node ${start + 1} - Node ${end + 1}`}
//               <button onClick={() => removeVertex(index)}>❌</button>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// // Function to get the color for a node based on its active state
// const getNodeColor = (node) => {
//   switch (node.attributes.active) {
//     case "true":
//       return "green";
//     case "false":
//       return "red";
//     case "none":
//       return "black";
//     default:
//       return "black";
//   }
// };

// export default Grid;


