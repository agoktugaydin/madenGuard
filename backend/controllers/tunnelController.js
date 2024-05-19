const { Node, Vertex, Corridor} = require('../models/TunnelData');

async function saveCorridorToDatabase(tunnelId, cells) {
    try {
        // koridor varsa guncelle yoksa oluştur
        const existingCorridor = await Corridor.findOne({ tunnelId });
        if (existingCorridor) {
            await Corridor.updateOne({ tunnelId }, { cells });
        } else {
            await Corridor.create({ tunnelId, cells });
        }
        const corridor = await Corridor.findOne({ tunnelId });
        console.log('Corridor saved to MongoDB:', corridor);
        return corridor;
    } catch (error) {
        console.error('Error saving corridor:', error);
        throw error;
    }
}

function formatCorridorData(data) {
    return {
        tunnelId: parseInt(data.tunnelId),
        cells: data.cells.map(cell => ({ row: cell.row, col: cell.col }))
    };
}

async function fetchCorridorFromDatabase(tunnelId) {
    try {
        const corridor = await Corridor.find({ tunnelId });
        console.log('Corridor fetched from MongoDB:', corridor);
        return corridor;
    } catch (error) {
        console.error('Error fetching corridor:', error);
        throw error;
    }
}

async function saveNodesToDatabase(nodes) {
    try {
        const savedNodes = await Node.insertMany(nodes);
        console.log('Nodes saved to MongoDB:', savedNodes);
        return savedNodes;
    } catch (error) {
        console.error('Error saving nodes:', error);
        throw error;
    }
}

async function saveVerticesToDatabase(vertices) {
    try {
        const savedVertices = await Vertex.insertMany(vertices);
        console.log('Vertices saved to MongoDB:', savedVertices);
        return savedVertices;
    } catch (error) {
        console.error('Error saving vertices:', error);
        throw error;
    }
}

async function fetchNodesFromDatabase() {
    try {
        const nodes = await Node.find({});
        console.log('Nodes fetched from MongoDB:', nodes);
        return nodes;
    } catch (error) {
        console.error('Error fetching nodes:', error);
        throw error;
    }
}

async function fetchVerticesFromDatabase() {
    try {
        const vertices = await Vertex.find({});
        console.log('Vertices fetched from MongoDB:', vertices);
        return vertices;
    } catch (error) {
        console.error('Error fetching vertices:', error);
        throw error;
    }
}

async function saveTunnelDataToDatabase(tunnelId, tunnelData) {
    try {
        const { nodes, vertices, corridor } = tunnelData;

        if (!nodes || !Array.isArray(nodes) || !vertices || !Array.isArray(vertices) || !corridor || !Array.isArray(corridor)) {
            throw new Error('Invalid tunnel data format');
        }

        // Save or update nodes
        for (const node of nodes) {
            const existingNode = await Node.findOne({ nodeId: node.nodeId });
            if (existingNode) {
                await Node.updateOne({ nodeId: node.nodeId }, node);
            } else {
                await Node.create(node);
            }
        }

        // Save or update vertices
        for (const vertex of vertices) {
            const existingVertex = await Vertex.findOne({ start: vertex.start, end: vertex.end });
            if (!existingVertex) {
                await Vertex.create(vertex);
            }
        }

        // Save or update corridor
        const existingCorridor = await Corridor.findOne({ tunnelId });
        if (existingCorridor) {
            await Corridor.updateOne({ tunnelId }, { cells: corridor });
        } else {
            await Corridor.create({ tunnelId, cells: corridor });
        }
        
        return { nodes, vertices, corridor };
    } catch (error) {
        console.error('Error saving tunnel data:', error);
        throw error;
    }
}


async function getTunnelDataFromDatabase(tunnelId) {
    try {
        const nodes = await Node.find({ tunnelId });
        const vertices = await Vertex.find({ tunnelId });
        const corridor = await fetchCorridorFromDatabase(tunnelId);

        return { nodes, vertices, corridor };
    } catch (error) {
        console.error('Error fetching tunnel data:', error);
        throw error;
    }
}

async function removeNodeFromDatabase(nodeId) {
    try {
        await Node.deleteOne({ nodeId });
        console.log(`Node with ID ${nodeId} removed from the database`);
    } catch (error) {
        console.error(`Error removing node with ID ${nodeId} from the database:`, error);
        throw error;
    }
}


module.exports = {
    saveTunnelDataToDatabase,
    saveNodesToDatabase,
    saveVerticesToDatabase,
    saveCorridorToDatabase,
    fetchNodesFromDatabase,
    fetchVerticesFromDatabase,
    fetchCorridorFromDatabase,
    getTunnelDataFromDatabase,
    removeNodeFromDatabase,
    formatCorridorData
};