import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const response = await fetch('https://e41d-2a02-9130-88a7-7ca8-2090-d949-3d01-8d47.ngrok-free.app/sensores');
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
