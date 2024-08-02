"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const body_parser_1 = __importDefault(require("body-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
// Connecting to MongoDB
mongoose_1.default.connect('mongodb+srv://test:bi38YGq5HEvc9WVx@birthdays.aertolr.mongodb.net/?retryWrites=true&w=majority&appName=Birthdays')
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error('MongoDB connection error:', err));
// Creatiing a schema
const birthdaySchema = new mongoose_1.default.Schema({
    name: String,
    dob: Date
});
const Birthday = mongoose_1.default.model('Birthday', birthdaySchema);
const urlencodedParser = body_parser_1.default.urlencoded({ extended: false });
function default_1(app) {
    app.get('/', (req, res) => {
        res.render('index');
    });
    app.post('/birthday', urlencodedParser, (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.body.name && req.body.dob) {
                const newBirthday = new Birthday({
                    name: req.body.name,
                    dob: new Date(req.body.dob)
                });
                yield newBirthday.save();
                res.redirect('/birthday/success');
            }
            else {
                res.status(400).send('Name and DOB are required');
            }
        }
        catch (err) {
            console.error('Error saving item:', err);
            res.status(500).send('Internal Server Error');
        }
    }));
    app.get('/birthday/success', (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield Birthday.find({});
            const currentDate = new Date();
            let nearestBirthday = null;
            nearestBirthday = data.reduce((nearest, birthday) => {
                if (birthday.dob) {
                    const birthdayDate = new Date(currentDate.getFullYear(), birthday.dob.getMonth(), birthday.dob.getDate());
                    const diff = birthdayDate.getTime() - currentDate.getTime();
                    if (diff > 0 && (!nearest || diff < nearest.diff)) {
                        return { name: birthday.name, dob: birthday.dob, diff: diff };
                    }
                }
                return nearest;
            }, null);
            if (!nearestBirthday) {
                nearestBirthday = data.reduce((nearest, birthday) => {
                    if (birthday.dob) {
                        const birthdayDate = new Date(currentDate.getFullYear(), birthday.dob.getMonth(), birthday.dob.getDate());
                        const diff = birthdayDate.getTime() - currentDate.getTime();
                        if (!nearest || diff < nearest.diff) {
                            return { name: birthday.name, dob: birthday.dob, diff: diff };
                        }
                    }
                    return nearest;
                }, null);
            }
            res.render('submit-birthday', { birthdays: data, nearestBirthday: nearestBirthday });
        }
        catch (err) {
            console.error('Error retrieving data:', err);
            res.status(500).send('Internal Server Error');
        }
    }));
    app.post('/birthday/delete/:index', (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const index = parseInt(req.params.index, 10);
            const birthdays = yield Birthday.find({});
            if (index >= 0 && index < birthdays.length) {
                yield Birthday.findByIdAndDelete(birthdays[index]._id);
                res.redirect('/birthday/success');
            }
            else {
                res.status(400).send('Invalid index');
            }
        }
        catch (err) {
            console.error('Error deleting item:', err);
            res.status(500).send('Internal Server Error');
        }
    }));
    app.post('/birthday/change/:index', urlencodedParser, (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const index = parseInt(req.params.index, 10);
            const birthdays = yield Birthday.find({});
            if (index >= 0 && index < birthdays.length) {
                if (req.body.newDob) {
                    birthdays[index].dob = new Date(req.body.newDob);
                    yield birthdays[index].save();
                    res.redirect('/birthday/success');
                }
                else {
                    res.status(400).send('New DOB is required');
                }
            }
            else {
                res.status(400).send('Invalid index');
            }
        }
        catch (err) {
            console.error('Error changing item:', err);
            res.status(500).send('Internal Server Error');
        }
    }));
}
