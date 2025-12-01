const { WebSocketServer } = require('ws'); 
const express = require("express");

const app = express();
const HTTP_PORT = 3000;

app.use(express.json());

app.post("/broadcast/incidente", (req, res) => {
  const incidente = req.body;
  console.log("Incidente recibido vía HTTP:", incidente);

  clients.forEach(client => {
    if (client.readyState === 1) { 
        client.send(JSON.stringify({
            event: "incidente.creado",
            data: incidente
        }));
    }
  });

  res.json({ success: true, message: "Enviado a " + clients.length + " clientes" });
});

app.post("/broadcast/asignacion-ambulancia", (req, res) => {
  const payload = req.body;
  console.log("Asignación enviada:", payload);

  clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(payload));
    }
  });

  res.json({ success: true, message: "Asignación enviada a ambulancias" });
});


app.listen(HTTP_PORT, () => {
    console.log(`API REST escuchando en http://localhost:${HTTP_PORT}`);
});

const wss = new WebSocketServer({ port: 8080 });
let clients = [];

wss.on('connection', (ws) => {
  console.log('Nuevo cliente WebSocket conectado');
  clients.push(ws);

  ws.on('message', (msg) => {
    const messageString = msg.toString();
    
    for (let c of clients) {
      if (c !== ws && c.readyState === c.OPEN) {
        c.send(messageString);
      }
    }
  });

  ws.on('close', () => {
    console.log('Cliente WebSocket desconectado');
    clients = clients.filter(c => c !== ws);
  });
});

console.log('Servidor WebSocket activo en ws://localhost:8080');