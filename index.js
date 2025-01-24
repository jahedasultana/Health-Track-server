const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// Middleware
app.use(express.json()); // To parse JSON request bodies
app.use(cors());

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wotzmkf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oy4gwmh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    // const userCollections = client.db('Health-Track').collection('users');
    // const serviceCollections = client.db('Health-Track').collection('services');

    const userCollections = client.db('health-track').collection('users');
    const serviceCollections = client.db('health-track').collection('services');




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

    // user role finding 
    app.get("/user_role/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const user = await userCollections.findOne({ email });

        console.log(user);

        if (user) {
          res.json({ role: user.role });
        } else {
          res.status(404).json({ message: "User not found" });
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });


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

    // service request added
    // app.post('/service_request', async (req, res) => {
    //   const { userEmail, doctorEmail, status, userDetaild } = req.body;

    //   if (!doctorEmail || !userEmail || !userDetaild) {
    //     return res.status(400).json({ error: 'Missing required fields' });
    //   }

    //   try {
    //     // Update or insert the data
    //     const result = await serviceCollections.updateOne(
    //       { userEmail: userEmail },
    //       {
    //         $setOnInsert: {
    //           userEmail: userEmail,
    //           doctorEmail: doctorEmail,
    //           status,
    //         },
    //         $push: {
    //           userData: {
    //             userDetaild
    //           }
    //         }
    //       },
    //       { upsert: true } // Create a new document if it doesn't exist
    //     );

    //     res.json({ message: 'Data added successfully', result });
    //   } catch (err) {
    //     console.error(err);
    //     res.status(500).json({ error: 'Internal server error' });
    //   }
    // });

    app.post('/service_request', async (req, res) => {
      const { userEmail, doctorEmail, status, userDetaild } = req.body;

      if (!doctorEmail || !userEmail || !userDetaild) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      try {
        const data = {
          userEmail,
          doctorEmail,
          status,
          ...userDetaild,
        }
        // Update or insert the data
        const result = await serviceCollections.insertOne(data);
        res.json({ message: 'Data added successfully', result });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });



    // use this route two data get pourpous , chnage it after make user
    app.get('/user_data_get', async (req, res) => {
      try {
        const result = await serviceCollections.find().toArray()
        return res.send(result)
      } catch (error) {
        console.log(error);
      }
    })

    // &&& doctor page show all api &&&
    // app.get('/doctor-service',async(req,res)=>{
    //   try {
    //     const result = await serviceCollections.
    //   } catch (error) {
    //     console.log(error);
    //   }
    // })


    // user all api is here
    app.get('/user_service/:email', async (req, res) => {
      const { email } = req.params;

      try {
        const userData = await serviceCollections.find({ userEmail: email }).toArray(); // Adjust `collection` to your DB reference
        if (userData.length === 0) {
          return res.status(404).json({ message: "No data found for this email." });
        }
        res.status(200).json(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ message: "Internal server error." });
      }
    });

    app.get('/doctor_service/:email', async (req, res) => {
      const { email } = req.params;

      const result = await serviceCollections.findOne({doctorEmail: email});
      res.send(result)
    });

    app.put("/doctor_service/update_status/:id", async (req, res) => {
      try {
          const id = req.params.id;
          const { status } = req.body;

          if (!id || !status) {
              return res.status(400).json({ message: "Invalid request data" });
          }
  
          const result = await serviceCollections.updateOne(
              { _id: new ObjectId(id) },
              { $set: { status: status } }
          );
  
          if (result.modifiedCount === 1) {
              res.status(200).json({ message: "Status updated successfully" });
          } else {
              res.status(404).json({ message: "Document not found" });
          }
      } catch (error) {
          console.error("Error updating status:", error);
          res.status(500).json({ message: "Server error" });
      }
  });


    //  %%%%%%%%%%%%%%%%% admin all api %%%%%%%%%%%%%%%
    // doctor added
    app.post("/add-doctor", async (req, res) => {
      const { email, name, role, service_experience, service_category, service_give, availability, loginStatus } = req.body;

      try {
        const existingDoctor = await userCollections.findOne({ email });

        if (existingDoctor) {
          return res.status(400).json({ success: false, message: "Doctor already exists." });
        }

        const newDoctor = {
          name,
          role,
          email,
          service_experience,
          service_category,
          service_give,
          availability,
          loginStatus,
        };

        await userCollections.insertOne(newDoctor);
        res.status(201).json({ success: true, message: "Doctor added successfully." });
      } catch (error) {
        console.error("Error adding doctor:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
      }
    });

    // all users show
    app.get("/all-users", async (req, res) => {
      try {
        const users = await userCollections.find({ role: "user" }).toArray();
        res.status(200).json(users);
      } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // all doctor
    app.get("/all-doctors", async (req, res) => {
      try {
        const doctors = await userCollections.find({ role: "doctor" }).toArray();
        res.status(200).json(doctors);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });


    // doctor profile chage
    app.get('/doctor-profile', async (req, res) => {
      const { email } = req.query; // Get email from query params

      try {
        const doctor = await userCollections.findOne({ email: email });
        if (doctor) {
          res.json(doctor);
        } else {
          res.status(404).send('Doctor not found');
        }
      } catch (error) {
        res.status(500).send('Error fetching doctor profile');
      }
    });


    app.put('/doctor-profile/:id', async (req, res) => {
      const doctorId = req.params.id; // Extracting doctor ID from URL
      const updatedData = req.body;

      // Validation or other checks can be added here

      try {
        // Validate doctorId format
        if (!ObjectId.isValid(doctorId)) {
          return res.status(400).json({ error: 'Invalid doctor ID format' });
        }

        // Prepare the update object (exclude _id field from update)
        const updateDoc = {
          $set: {
            name: updatedData.name || '',
            role: updatedData.role || '',
            service_experience: updatedData.service_experience || '',
            service_category: updatedData.service_category || '',
            availability: updatedData.availability || 'available', // Default to 'available'
            service_give: updatedData.service_give || '',
          },
        };

        // Perform the update
        const result = await userCollections.updateOne(
          { _id: new ObjectId(doctorId) },
          updateDoc
        );

        if (result.modifiedCount === 0) {
          return res.status(404).json({ error: 'Doctor not found or no changes made' });
        }

        // Fetch the updated doctor data to return
        const updatedDoctor = await userCollections.findOne({ _id: new ObjectId(doctorId) });
        res.status(200).json(updatedDoctor); // Return updated doctor data
      } catch (error) {
        console.error('Error updating doctor profile:', error);
        res.status(500).json({ error: 'Error updating doctor data' });
      }
    });


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