import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';  // Import CORS middleware
import { apiKeyMiddleware } from './middleware/apiKeyMiddleware';


// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3000;

// Body parser middleware
app.use(bodyParser.json());

// Apply the API key middleware to all routes
app.use(apiKeyMiddleware);

// Use CORS middleware
app.use(cors());  // This will allow all origins by default

// MongoDB connection
mongoose.connect(process.env.DB_URL as string)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Error connecting to MongoDB:", err));

// Define Schema and Model for Habit and User
const habitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastDate: {
    date: { type: [String], required: true }
  }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pass: { type: String, required: true },
  habits: [habitSchema]
});

const User = mongoose.model('User', userSchema);

// Route to get the user's habits
app.get('/habits/:userName', async (req: Request, res: Response) => {
  const userName = req.params.userName;
  try {
    const user = await User.findOne({ name: userName });
    if (user) {
      res.json(user.habits);
    } else {
      res.status(404).send('User not found hihi');
    }
  } catch (err) {
    res.status(500).send('Error retrieving user habits');
  }
});

// Route to add a new date for a habit
app.post('/habits/:userName/:habitName', async (req: Request, res: Response) => {
  const { userName, habitName } = req.params;
  const { date } = req.body; // Expecting the date to be in ISO format string

  try {
    const user = await User.findOne({ name: userName });
    if (!user) {
      return res.status(404).send('User not found');
    }

    const habit = user.habits.find(h => h.name === habitName);
    if (!habit) {
      return res.status(404).send('Habit not found');
    }

    habit.lastDate?.date.push(date);
    await user.save(); // Save the updated user document

    res.status(200).send(`New date added to habit "${habitName}"`);
  } catch (err) {
    res.status(500).send('Error updating habit date');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
