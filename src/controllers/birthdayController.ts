import express, { Request, Response, Application } from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

// Connecting to MongoDB
mongoose.connect('mongodb+srv://test:bi38YGq5HEvc9WVx@birthdays.aertolr.mongodb.net/?retryWrites=true&w=majority&appName=Birthdays')
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error('MongoDB connection error:', err));

// Creatiing a schema
const birthdaySchema = new mongoose.Schema({
    name: String,
    dob: Date
});
const Birthday = mongoose.model('Birthday', birthdaySchema);

// Defining the interface for the result of the reduce function
interface NearestBirthday {
    name: string;
    dob: Date;
    diff: number;
}

const urlencodedParser = bodyParser.urlencoded({ extended: false });

export default function (app: Application) {
    app.get('/', (req: Request, res: Response) => {
        res.render('index'); 
    });

    app.post('/birthday', urlencodedParser, async (req: Request, res: Response) => {
        try {
            if (req.body.name && req.body.dob) {
                const newBirthday = new Birthday({
                    name: req.body.name,
                    dob: new Date(req.body.dob)
                });
                await newBirthday.save();
                res.redirect('/birthday/success');
            } else {
                res.status(400).send('Name and DOB are required');
            }
        } catch (err) {
            console.error('Error saving item:', err);
            res.status(500).send('Internal Server Error');
        }
    });

    app.get('/birthday/success', async (req: Request, res: Response) => {
        try {
            const data = await Birthday.find({});
            const currentDate = new Date();

            let nearestBirthday: NearestBirthday | null = null;

            nearestBirthday = data.reduce((nearest: NearestBirthday | null, birthday: any) => {
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
                nearestBirthday = data.reduce((nearest: NearestBirthday | null, birthday: any) => {
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
        } catch (err) {
            console.error('Error retrieving data:', err);
            res.status(500).send('Internal Server Error');
        }
    });

    app.post('/birthday/delete/:index', async (req: Request, res: Response) => {
        try {
            const index = parseInt(req.params.index, 10);
            const birthdays = await Birthday.find({});
            if (index >= 0 && index < birthdays.length) {
                await Birthday.findByIdAndDelete(birthdays[index]._id);
                res.redirect('/birthday/success');
            } else {
                res.status(400).send('Invalid index');
            }
        } catch (err) {
            console.error('Error deleting item:', err);
            res.status(500).send('Internal Server Error');
        }
    });

    app.post('/birthday/change/:index', urlencodedParser, async (req: Request, res: Response) => {
        try {
            const index = parseInt(req.params.index, 10);
            const birthdays = await Birthday.find({});
            if (index >= 0 && index < birthdays.length) {
                if (req.body.newDob) {  
                    birthdays[index].dob = new Date(req.body.newDob);
                    await birthdays[index].save();
                    res.redirect('/birthday/success');
                } else {
                    res.status(400).send('New DOB is required');
                }
            } else {
                res.status(400).send('Invalid index');
            }
        } catch (err) {
            console.error('Error changing item:', err);
            res.status(500).send('Internal Server Error');
        }
    });
}
