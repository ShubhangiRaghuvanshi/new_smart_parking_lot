const { Server } = require('socket.io');

let io; // Declare io globally

// Initialize Socket.IO with the HTTP server
const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('≡ƒƒó Client connected:', socket.id);

        // Send mock parking data every 3 seconds
        setInterval(() => {
            socket.emit('parkingData', {
                spotsAvailable: Math.floor(Math.random() * 50),
                occupancyRate: (Math.random() * 100).toFixed(2)
            });
        }, 3000);

        socket.on('disconnect', () => {
            console.log('≡ƒö┤ Client disconnected:', socket.id);
        });
    });
};

// Getter function to access the io instance globally
const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

module.exports = { initSocket, getIo };



