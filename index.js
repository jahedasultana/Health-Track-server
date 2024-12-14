const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// Middleware
app.use(express.json()); // To parse JSON request bodies
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wotzmkf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const userCollections = client.db('Health-Track').collection('users');
    const serviceCollections = client.db('Health-Track').collection('services');

    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user?.email }
      const existingEmail = await userCollections.findOne(query)
      if (existingEmail) {
        return res.send({ message: 'The User already existing', insertedId: null })
      }
      const result = await userCollections.insertOne(user)
      res.send(result)
    })


    // API route to get only doctors
    app.get("/doctors", async (req, res) => {
      try {
        const doctors = await userCollections.find({ role: "doctor" }).toArray();
        res.status(200).json(doctors);
      } catch (error) {
        res.status(500).json({ message: "Error fetching data", error });
      }
    });

    // API route to get a single doctor by ID
    app.get("/doctors/:id", async (req, res) => {
      const { id } = req.params;

      try {
        const doctor = await userCollections.findOne({ _id: new ObjectId(id), role: "doctor" });
        if (!doctor) {
          return res.status(404).json({ message: "Doctor not found" });
        }
        res.status(200).json(doctor);
      } catch (error) {
        res.status(500).json({ message: "Error fetching doctor", error });
      }
    });

    app.post('/service_request', async (req, res) => {
      const serviceData = req.body;

      try {
        const result = await serviceCollections.insertOne(serviceData)
        return res.send(result)
      } catch (error) {
        console.log(error);
      }

    })

    app.post('/service_request', async (req, res) => {
      const serviceData = req.body;

      try {
        const result = await serviceCollections.insertOne(serviceData)
        return res.send(result)
      } catch (error) {
        console.log(error);
      }

    })

    // use this route two data get pourpous , chnage it after make user
    app.get('/user_data_get', async (req, res) => {
      try {
        const result = await serviceCollections.find().toArray()
        return res.send(result)
      } catch (error) {
        console.log(error);
      }
    })



    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);






// Routes
app.get('/', (req, res) => {
  res.send('Welcome to My Express App!');
});


// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});