const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
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
    const doctorsCollections = client.db('Health-Track').collection('doctors');

    app.post("/userCreate", async(req,res) =>{
      const body = req.body;
      const {email,userRole,name} = body;
      console.log(body);
      return
      try {
        const existingUser = await userCollections.findOne({email:email})
        if(existingUser){
          return res.send({message: "user already off"})
        }
        
      } catch (error) {
        
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