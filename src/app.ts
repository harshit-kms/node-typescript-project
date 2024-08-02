import express from 'express';
import birthdayController from './controllers/birthdayController';

const app = express();

// Template engine setup
app.set('view engine', 'ejs');
app.set('views', './src/views');

// Static files
app.use(express.static('./dist/public')); // Serve static files from dist/public

// Fire controllers
birthdayController(app);

// Listen to port
app.listen(3000, () => {
    console.log('Listening to port 3000');
});
