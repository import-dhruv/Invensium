import app from './app';
import { config } from './config';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║          CoreInventory Backend Server            ║
╠══════════════════════════════════════════════════╣
║  Environment : ${config.nodeEnv.padEnd(33)}║
║  Port        : ${PORT.toString().padEnd(33)}║
║  API Base    : http://localhost:${PORT}/api${' '.repeat(13)}║
╚══════════════════════════════════════════════════╝
  `);
});
