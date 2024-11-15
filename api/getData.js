import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const response = await fetch('https://695c-2a02-9130-88a7-26e0-a849-cb58-6fa1-bb36.ngrok-free.app/sensores');
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
