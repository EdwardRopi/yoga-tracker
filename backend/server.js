require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// API маршруты
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/yoga',         require('./routes/yoga'));
app.use('/api/notes',        require('./routes/notes'));
app.use('/api/profile',      require('./routes/profile'));
app.use('/api/progress',     require('./routes/progress'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/programs',     require('./routes/programs'));
app.use('/api/stats',        require('./routes/stats'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Всё остальное → frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// Сначала инициализируем БД, потом запускаем сервер
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Yoga Tracker running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('DB init failed:', err.message);
    process.exit(1);
  });
