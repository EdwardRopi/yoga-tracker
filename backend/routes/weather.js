const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');

// GET /api/weather?city=Москва
router.get('/', auth, async (req, res) => {
  try {
    const city = req.query.city || 'Moscow';
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey || apiKey === 'ВАШ_КЛЮЧ_ПОГОДЫ') {
      // Возвращаем заглушку если ключ не настроен
      return res.json({
        city: city,
        temp: null,
        feels_like: null,
        description: 'Настройте WEATHER_API_KEY',
        icon: '🌤',
        humidity: null,
        wind: null
      });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather`;
    const response = await axios.get(url, {
      params: {
        q: city,
        appid: apiKey,
        units: 'metric',
        lang: 'ru'
      },
      timeout: 5000
    });

    const data = response.data;
    const iconMap = {
      '01': '☀️', '02': '⛅', '03': '🌥', '04': '☁️',
      '09': '🌧', '10': '🌦', '11': '⛈', '13': '❄️', '50': '🌫'
    };

    const iconCode = data.weather[0].icon.slice(0, 2);
    const icon = iconMap[iconCode] || '🌤';

    res.json({
      city: data.name,
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      description: data.weather[0].description,
      icon,
      humidity: data.main.humidity,
      wind: Math.round(data.wind.speed)
    });

  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'Город не найден' });
    }
    console.error('Weather error:', err.message);
    res.status(500).json({ error: 'Ошибка получения погоды' });
  }
});

module.exports = router;
