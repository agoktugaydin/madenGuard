const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const corridorSchema = new Schema({
    tunnelId: Number,
    cells: [{ row: Number, col: Number }]
});


const nodeSchema = new Schema({
    tunnelId: Number, 
    nodeId: Number,
    row: Number,
    col: Number,
    attributes: {
        name: String,
        active: String
    }
});

const vertexSchema = new Schema({
    tunnelId: Number,
    start: Number, 
    end: Number    
});


const Node = mongoose.model('Node', nodeSchema);
const Vertex = mongoose.model('Vertex', vertexSchema);
const Corridor = mongoose.model('Corridor', corridorSchema);

module.exports = { Node, Vertex, Corridor };
