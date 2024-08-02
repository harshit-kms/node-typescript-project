"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const birthdayController_1 = __importDefault(require("./controllers/birthdayController"));
const app = (0, express_1.default)();
// Template engine setup
app.set('view engine', 'ejs');
app.set('views', './src/views');
// Static files
app.use(express_1.default.static('./dist/public')); // Serve static files from dist/public
// Fire controllers
(0, birthdayController_1.default)(app);
// Listen to port
app.listen(3000, () => {
    console.log('Listening to port 3000');
});
