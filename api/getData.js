import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const response = await fetch('https://539c-2a02-9130-88b6-2540-d843-fd9d-f67b-6144.ngrok-free.app/dht');
    if (!response.ok) {
      throw new Error(`Error de respuesta: ${response.status}`);
    }
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error obteniendo datos:', error);
    res.status(500).json({ error: 'Error obteniendo datos del ESP32' });
  }
}
