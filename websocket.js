const { WebSocketServer } = require('ws'); 
const express = require("express");

const app = express();
const HTTP_PORT = 3000;

app.use(express.json());

// --- ENDPOINT EXISTENTE 1: CREAR ---
app.post("/broadcast/incidente", (req, res) => {
  const incidente = req.body;
  console.log("Incidente recibido:", incidente);
  broadcast({ event: "incidente.creado", data: incidente });
  res.json({ success: true });
});

// --- ENDPOINT EXISTENTE 2: ASIGNAR ---
app.post("/broadcast/asignacion-ambulancia", (req, res) => {
  const payload = req.body;
  console.log("Asignación enviada:", payload);
  broadcast(payload); // El payload ya trae la estructura { event, data } desde Laravel
  res.json({ success: true });
});

// --- NUEVO ENDPOINT 3: ACTUALIZAR DATOS (AGREGA ESTO) ---
// ... (Tus imports y configuraciones previas)

app.post("/broadcast/incidente-actualizado", (req, res) => {
  // req.body es el objeto COMPLETO del incidente que mandó Laravel
  const incidenteCompleto = req.body; 

  console.log("Actualización recibida. ID:", incidenteCompleto.id);
  console.log("Datos nuevos (ejemplo):", incidenteCompleto.descripcion);
  console.log("--- ACTUALIZACIÓN COMPLETA RECIBIDA ---");
  console.dir(incidenteCompleto, { depth: null, colors: true }); // Para que verifiques en consola

  // Enviamos todo a la App
  broadcast({ 
      event: "incidente.actualizado", 
      data: incidenteCompleto // <--- AQUÍ VA TODO EL MODELO
  });

  res.json({ success: true, message: "Datos actualizados enviados" });
});

// Función broadcast (ya la tenías, la pongo por referencia)
function broadcast(jsonData) {
  clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(jsonData));
    }
  });
}

// ... (Resto del servidor)

// --- FUNCIÓN HELPER PARA NO REPETIR CÓDIGO ---
function broadcast(jsonData) {
  clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(jsonData));
    }
  });
}

app.listen(HTTP_PORT, () => {
    console.log(`API REST escuchando en http://localhost:${HTTP_PORT}`);
});

// ... (El resto de tu código del WebSocketServer se queda igual) ...
const wss = new WebSocketServer({ port: 8080 });
let clients = [];

wss.on('connection', (ws) => {
  console.log('Cliente conectado');
  clients.push(ws);
  
  // Opcional: Manejo de ping/pong para mantener viva la conexión
  ws.on('close', () => {
    clients = clients.filter(c => c !== ws);
  });
});

console.log('Servidor WebSocket activo en ws://localhost:8080');