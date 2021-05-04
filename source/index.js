// Express
const express = require('express');
// Handlebars
const hbs = require('express-handlebars');
// Path
const path = require('path');

// Routers
const { apiRouter } = require('./routes/api');
const { appRouter } = require('./routes/app')

// App Initialization
const app = express();

// App Costants
const publicPath = path.join(__dirname, '../public');
const hbsLayoutPath = path.join(__dirname, '../views/layouts');

// Server public files path configuration
app.use(express.static(publicPath));

// HBS Configuration
app.engine('.hbs', hbs({ extname: '.hbs', layoutsDir: hbsLayoutPath }));
app.set('view engine', '.hbs');

// API Routes
app.use(apiRouter);
app.use(appRouter);

// Starts the server
app.listen(process.env.PORT, () => console.log(`Server is up and running on port ${process.env.PORT}.`));