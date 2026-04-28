// Dynamic Node.js Express application
// Serves a homepage and a JSON API endpoint.

const express = require('express');
const os = require('os');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  const now = new Date();
  res.send(`
    <html>
      <head>
        <title>Dynamic AWS Node App</title>
      </head>
      <body>
        <h1>Dynamic AWS Node App</h1>
        <p>Server time: ${now.toLocaleString()}</p>
        <p>Host: ${os.hostname()}</p>
        <p>Use <code>/api/message</code> for JSON output.</p>
      </body>
    </html>
  `);
});

app.get('/api/message', (req, res) => {
  res.json({
    message: 'Hello from the dynamic Dockerized Node.js app!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    hostname: os.hostname()
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
