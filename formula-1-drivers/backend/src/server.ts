import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// Serve driver photos statically
app.use('/photos', express.static(path.join(__dirname, 'photos')));

// In-memory storage for driver data
let drivers: Driver[] = [];

// Read drivers data from JSON file
fs.readFile('drivers.json', 'utf-8', (err, data) => {
  if (err) {
    console.error('Error reading drivers.json:', err);
  } else {
    drivers = JSON.parse(data);
    assignRandomPlaces();
    console.log('Drivers data loaded successfully');
    console.log('Drivers:', drivers);
  }
});

// Assign random places to drivers
function assignRandomPlaces() {
  drivers.forEach((driver) => {
    driver.place = Math.floor(Math.random() * drivers.length) + 1;
  });
}

// GET endpoint to serve driver data
app.get('/api/drivers', (req, res) => {
  console.log('GET /api/drivers');
  res.json(drivers);
});

// POST endpoint to handle driver overtaking
app.post('/api/drivers/:driverId/overtake', (req, res) => {
  const driverId = parseInt(req.params.driverId);
  console.log(`POST /api/drivers/${driverId}/overtake`);

  const index = drivers.findIndex((driver) => driver.id === driverId);

  if (index !== -1 && index > 0) {
    const currentDriver = drivers[index];
    const previousDriver = drivers[index - 1];

    // Swap places
    const tempPlace = currentDriver.place;
    currentDriver.place = previousDriver.place;
    previousDriver.place = tempPlace;

    console.log(`Driver ${currentDriver.firstname} ${currentDriver.lastname} overtook ${previousDriver.firstname} ${previousDriver.lastname}`);
    console.log('Updated drivers:', drivers);

    res.sendStatus(200);
  } else {
    console.log(`Invalid overtake attempt for driver with ID ${driverId}`);
    res.sendStatus(400);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Driver interface
interface Driver {
  id: number;
  code: string;
  firstname: string;
  lastname: string;
  country: string;
  team: string;
  place?: number;
}