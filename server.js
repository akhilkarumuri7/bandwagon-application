const path = require("path");
const express = require('express');
const router = express.Router();  // Create a router
const app = express();
const PORT = process.argv[2] ||  3001;

// For the .env file
require("dotenv").config({
    path: path.resolve(__dirname, "credentials/.env"),
});
const { MongoClient, ServerApiVersion } = require("mongodb");

// Set up middleware to serve static files from the project root
app.use(express.static(__dirname));
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:false}));

// MongoDB connection variables from your .env file
const dbName = process.env.MONGO_DB_NAME || "BandwagonApps";
const collectionName = process.env.MONGO_COLLECTION || "applications";
const uri = process.env.MONGO_CONNECTION_STRING || "mongodb+srv://devp2303:Radhasoami13@cluster0.mypnnnc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

// Define routes using the Express Router

// Home route - serve the HTML form
router.get("/", (req, res) => {
    console.log("Serving Application.html");
    res.sendFile(path.join(__dirname, "Application.html"));
});

// Form submission route
router.post("/submitApplication", async (req, res) => {
    console.log("Form submission received:", req.body);
    const { 
        name, 
        age, 
        dob, 
        reason, 
        reason_other, 
        last_team, 
        first_time, 
        background, 
        new_team, 
        length, 
        backup_team, 
        championship_dep 
    } = req.body;
    
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const database = client.db(dbName);
        const collection = database.collection(collectionName);
        
        // Create the fan document
        const fan = {
            name,
            age: Number(age),
            dateOfBirth: dob,
            reasonForTransfer: reason === "D" ? reason_other : reason,
            lastTeam: last_team,
            firstTimeBandWagoner: first_time,
            background: background || "N/A",
            newTeam: new_team,
            lengthOfCommitment: length,
            backupTeam: backup_team,
            commitmentDependentOnChampionship: championship_dep,
            submissionDate: new Date()
        };
        
        console.log("Inserting document:", fan);
        
        // Insert the document into MongoDB
        const result = await collection.insertOne(fan);
        console.log("Document inserted with ID:", result.insertedId);

        // Respond with a simple confirmation
        res.send(`
            <html>
            <head>
                <title>Application Submitted</title>
                <style>
                    body {
                        font-family: 'Oswald', sans-serif;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                        text-align: center;
                    }
                    h1 {
                        color: #013369;
                    }
                    .success {
                        background-color: #e8f5e9;
                        padding: 20px;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    a {
                        color: #013369;
                        text-decoration: none;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <h1>NFL Bandwagon Transferral</h1>
                <div class="success">
                    <h2>Application Submitted Successfully!</h2>
                    <p>Your bandwagon transfer request has been recorded.</p>
                </div>
                <a href="/">Submit Another Application</a>
            </body>
            </html>
        `);
    } catch (e) {
        console.error("Database error:", e);
        res.status(500).send("There was an error processing your application. Please try again.");
    } finally {
        await client.close();
        console.log("MongoDB connection closed");
    }
});

// Serve the view-applicants.html file
router.get("/view-applicants.html", (req, res) => {
    res.sendFile(path.join(__dirname, "view-applicants.html"));
});

// API endpoint to get all applications
router.get("/api/applications", async (req, res) => {
    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);
        
        const applications = await collection.find({}).toArray();
        res.json(applications);
    } catch (e) {
        console.error("Database error:", e);
        res.status(500).json({ error: "Failed to retrieve applications" });
    } finally {
        await client.close();
    }
});

// API endpoint to remove all applications
router.delete("/api/applications/removeAll", async (req, res) => {
    try {
      await client.connect();
      const database = client.db(dbName);
      const collection = database.collection(collectionName);
      
      // Count documents before deletion to return in response
      const count = await collection.countDocuments({});
      
      // Delete all documents
      const result = await collection.deleteMany({});
      
      res.json({ 
        success: true, 
        message: "All applications removed successfully", 
        count: count 
      });
    } catch (e) {
      console.error("Database error:", e);
      res.status(500).json({ 
        success: false, 
        error: "Failed to remove applications" 
      });
    } finally {
      await client.close();
    }
  });

  
// Add a simple status endpoint
router.get("/status", (req, res) => {
    res.json({ status: "Server is running", time: new Date() });
});

// Mount the router on the app
app.use('/', router);

// Start server
const server = app.listen(PORT, () => {
    console.log(`Web server started and running at http://localhost:${PORT}`);
    console.log("Type 'stop' to shutdown server: ");
});

// Stop when stop is entered 
process.stdin.on("data", (data) => {
    const input = data.toString().trim().toLowerCase();
    if (input === "stop") {
        console.log("Shutting down the server");
        server.close(() => {
            process.exit(0);
        });
    }
});