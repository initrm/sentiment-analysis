// Router
const express = require('express');

// Initializes the router
const router = new express.Router();

// Serves the index page
router.get('/', (req, res) => res.render('index', { layout : 'base' }));

// Serves the application page
router.get('/app', (req, res) => res.render('app', { layout : 'base' }));

// Serves the about page
router.get('/about', (req, res) => res.render('about', { layout : 'base' }));

// Serves the settings page
router.get('/settings', (req, res) => res.render('settings', { layout : 'base' }));

// Not Found
router.get('*', (req, res) => res.render('404', { layout : 'base' }));

// Exports the router containing the api routes
module.exports = { appRouter: router }