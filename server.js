const path = require("path");
const express = require('express');
const app = express();
//change the port to whatever 
const PORT = process.argv[2] || 3002;

require("dotenv").config({
    path: path.resolve(__dirname, "credentials/.env"),
});
const { MongoClient, ServerApiVersion } = require("mongodb");

app.use(express.static(__dirname));
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:false}));

const username = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const dbName = process.env.MONGO_DB_NAME;
const collectionName = process.env.MONGO_COLLECTION;
const uri = process.env.MONGO_CONNECTION_STRING;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

app.get("/", (req, res) => {
    console.log("Serving Application.html");
    res.sendFile(path.join(__dirname, "Application.html"));
});

app.post("/submitApplication", async (req, res) => {
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