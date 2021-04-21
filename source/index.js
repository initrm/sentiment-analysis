// Express
const express = require('express');
// Handlebars
const hbs = require('express-handlebars');
// Path
const path = require('path');

// Routers
const { apiRouter } = require('./routes/api')

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
app.use(apiRouter)

// Serves the index page
app.get('/', (req, res) => res.render('index', { layout : 'base' }))

// Serves the application page
app.get('/app', (req, res) => res.render('app', { layout : 'base' }))

// Serves the about page
app.get('/about', (req, res) => res.render('about', { layout : 'base' }))

// Serves the settings page
app.get('/settings', (req, res) => res.render('settings', { layout : 'base' }))

// Not Found
app.get('*', (req, res) => res.render('404', { layout : 'base' }))

// Starts the server
app.listen(process.env.PORT, () => console.log(`Server is up and running on port ${process.env.PORT}.`));