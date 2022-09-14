const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';
const express = require('express');
const queryString = require("query-string")

const server = express()
    .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

const { Server } = require('ws');
const wss = new Server({ server });
var CLIENTS = {};
var BROADCAST_RECEIVER = [];
wss.on('connection', (ws, connectionRequest) => {
    // Unique Id

    ws.on('close', () => {
       console.log("A Client Close Connection");
    });

    var connectionParams = {};
    if(connectionRequest && connectionRequest.uri){
        const [_path, params] = connectionRequest?.url?.split("?");
        connectionParams = queryString.parse(params);
    }
    if(connectionParams.token && !CLIENTS[connectionParams.token]){
        CLIENTS[connectionParams.token] = ws;
        console.log("PElanggan");
    }else{
        BROADCAST_RECEIVER.push({socket: ws});
        console.log("BROADCAST/Kasir")
    }

    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        
        if(connectionParams.receiver){
            for (const key in CLIENTS) {
                if(connectionParams.receiver == key){
                    CLIENTS[key].send(JSON.stringify(parsedMessage));
                }
            }
        }else{
            BROADCAST_RECEIVER.forEach(receiver => {
                receiver.socket.send(JSON.stringify(parsedMessage));
            });
        }        
    });
});