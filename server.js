const path = require("path");
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = Number(process.env.PORT); 

//blocked our for render.com
// require("dotenv").config({
//     path: path.resolve(__dirname, "credentials/.env"),
// });

const { MongoClient, ServerApiVersion } = require("mongodb");

app.use(express.static(__dirname));
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:false}));

//db environment variables 
const username = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const dbName = process.env.MONGO_DB_NAME;
const collectionName = process.env.MONGO_COLLECTION;
const uri = process.env.MONGO_CONNECTION_STRING;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

const router = express.Router();
app.use('/', router);

router.get("/", (req, res) => {
    console.log("Serving Application.html");
    res.sendFile(path.join(__dirname, "Application.html"));
});

async function getTeamInfo(teamName) {
    try {
        const apiKey = process.env.SPORTS_API || "3";
        const encodedTeamName = encodeURIComponent(teamName);
        const url = `https://www.thesportsdb.com/api/v1/json/${apiKey}/searchteams.php?t=${encodedTeamName}`;
        
        console.log(`Fetching team info from: ${url}`);
        const response = await axios.get(url);
        
        //filtering for nfl teams
        //now we implemented a drop down for the teams, so we techincally don't need some of the filtering strings, 
        //but still good to keep incase API error
        if (response.data && response.data.teams && response.data.teams.length > 0) {
            const nflTeams = response.data.teams.filter(team => 
                team.strLeague === "NFL" || 
                team.strLeague === "National Football League" ||
                team.strSport === "American Football"
            );
            
            const team = nflTeams.length > 0 ? nflTeams[0] : response.data.teams[0];
            console.log("Selected team:", team.strTeam);
            console.log("Resolved logo (strTeamBadge):", team.strTeamBadge);
            
            const testImageUrl = "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/National_Football_League_logo.svg/1200px-National_Football_League_logo.svg.png";

            //need to do this because the free API doesn't have all the logos
            const fallbackLogos = {
                "Arizona Cardinals": "https://r2.thesportsdb.com/images/media/team/badge/xvuwtw1420646838.png",
                "Atlanta Falcons": "https://r2.thesportsdb.com/images/media/team/badge/rrpvpr1420658174.png",
                "Baltimore Ravens": "https://r2.thesportsdb.com/images/media/team/badge/einz3p1546172463.png",
                "Buffalo Bills": "https://r2.thesportsdb.com/images/media/team/badge/6pb37b1515849026.png",
                "Carolina Panthers": "https://r2.thesportsdb.com/images/media/team/badge/xxyvvy1420940478.png",
                "Chicago Bears": "https://r2.thesportsdb.com/images/media/team/badge/ji22531698678538.png",
                "Cincinnati Bengals": "https://r2.thesportsdb.com/images/media/team/badge/qqtwwv1420941670.png",
                "Cleveland Browns": "https://r2.thesportsdb.com/images/media/team/badge/squvxy1420942389.png",
                "Dallas Cowboys": "https://r2.thesportsdb.com/images/media/team/badge/wrxssu1450018209.png",
                "Denver Broncos": "https://r2.thesportsdb.com/images/media/team/badge/upsspx1421635647.png",
                "Detroit Lions": "https://r2.thesportsdb.com/images/media/team/badge/lgsgkr1546168257.png",
                "Green Bay Packers": "https://r2.thesportsdb.com/images/media/team/badge/rqpwtr1421434717.png",
                "Houston Texans": "https://r2.thesportsdb.com/images/media/team/badge/wqyryy1421436627.png",
                "Indianapolis Colts": "https://r2.thesportsdb.com/images/media/team/badge/wqqvpx1421434058.png",
                "Jacksonville Jaguars": "https://r2.thesportsdb.com/images/media/team/badge/0mrsd41546427902.png",
                "Kansas City Chiefs": "https://r2.thesportsdb.com/images/media/team/badge/936t161515847222.png",
                "Las Vegas Raiders": "https://r2.thesportsdb.com/images/media/team/badge/xqusqy1421724291.png",
                "Los Angeles Chargers": "https://r2.thesportsdb.com/images/media/team/badge/vrqanp1687734910.png",
                "Los Angeles Rams": "https://r2.thesportsdb.com/images/media/team/badge/8e8v4i1599764614.png",
                "Miami Dolphins": "https://r2.thesportsdb.com/images/media/team/badge/trtusv1421435081.png",
                "Minnesota Vikings": "https://r2.thesportsdb.com/images/media/team/badge/qstqqr1421609163.png",
                "New England Patriots": "https://r2.thesportsdb.com/images/media/team/badge/xtwxyt1421431860.png",
                "New Orleans Saints": "https://r2.thesportsdb.com/images/media/team/badge/nd46c71537821337.png",
                "New York Giants": "https://r2.thesportsdb.com/images/media/team/badge/vxppup1423669459.png",
                "New York Jets": "https://r2.thesportsdb.com/images/media/team/badge/hz92od1607953467.png",
                "Philadelphia Eagles": "https://r2.thesportsdb.com/images/media/team/badge/pnpybf1515852421.png",
                "Pittsburgh Steelers": "https://r2.thesportsdb.com/images/media/team/badge/2975411515853129.png",
                "San Francisco 49ers": "https://r2.thesportsdb.com/images/media/team/badge/bqbtg61539537328.png",
                "Seattle Seahawks": "https://r2.thesportsdb.com/images/media/team/badge/wwuqyr1421434817.png",
                "Tampa Bay Buccaneers": "https://r2.thesportsdb.com/images/media/team/badge/2dfpdl1537820969.png",
                "Tennessee Titans": "https://r2.thesportsdb.com/images/media/team/badge/m48yia1515847376.png",
                "Washington Commanders": "https://r2.thesportsdb.com/images/media/team/badge/rn0c7v1643826119.png"
                };


            return {
                name: team.strTeam,
                logo: team.strTeamBadge || fallbackLogos[team.strTeam] || testImageUrl,
                badge: team.strTeamBadge,
                banner: team.strTeamBanner,
                founded: team.intFormedYear || "N/A",
                stadium: team.strStadium || "N/A",
                stadiumThumb: team.strStadiumThumb,
                capacity: team.intStadiumCapacity || "N/A",
                description: team.strDescriptionEN || "No description available",
                website: team.strWebsite || "N/A",
                facebook: team.strFacebook || "N/A",
                twitter: team.strTwitter || "N/A",
                league: team.strLeague || "N/A"
            };
        } else {
            console.log("No teams found, using mock data for:", teamName);
            //return default info if team not found
            //now we implemented a drop down for the teams, so we techincally don't need this
            return getMockTeamInfo(teamName);
        }
    } catch (error) {
        console.error("Error fetching team info:", error);
        console.log("Using mock data due to API error");
        return getMockTeamInfo(teamName);
    }
}

//fallback function with mock data if API is not working
function getMockTeamInfo(teamName) {
    return {
        name: teamName,
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/National_Football_League_logo.svg/1200px-National_Football_League_logo.svg.png", // Generic NFL logo as fallback
        badge: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/National_Football_League_logo.svg/1200px-National_Football_League_logo.svg.png",
        banner: "https://static.clubs.nfl.com/image/upload/t_twitter_card_cover/f_auto/q_auto:best/nfl/axm2qb9nqiuhsw8pji0p.jpg",
        founded: "1960",
        stadium: teamName + " Stadium",
        stadiumThumb: "https://static.clubs.nfl.com/image/private/t_editorial_landscape_12_desktop/f_auto/packers/xb96kydvftf1gfb2bvxv.jpg",
        capacity: "65,000",
        description: "This is a placeholder description for " + teamName + ", an NFL team.",
        website: "www.nfl.com",
        facebook: "facebook.com/nfl",
        twitter: "twitter.com/nfl",
        league: "NFL"
    };
}


//form submission route
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
        
        //create the fan document
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
        
        //insert document into mongodb
        const result = await collection.insertOne(fan);
        console.log("Document inserted with ID:", result.insertedId);

       //get team info from API
       const teamInfo = await getTeamInfo(new_team);
       console.log("teamInfo returned:", teamInfo);

       let reasonText;
       switch(reason) {
           case 'A':
               reasonText = "Player Transfer";
               break;
           case 'B':
               reasonText = "Team Became Unpopular";
               break;
           case 'C':
               reasonText = "Team didn't make the Playoffs";
               break;
           case 'D':
               reasonText = reason_other;
               break;
           default:
               reasonText = "Other";
       }
       
       
       let lengthText;
       switch(length) {
           case 'A':
               lengthText = "One Season";
               break;
           case 'B':
               lengthText = "Length of Player's Contract";
               break;
           case 'C':
               lengthText = "When Team Loses The Playoffs";
               break;
           case 'D':
               lengthText = "Not Sure (Unstable)";
               break;
           default:
               lengthText = "Unspecified";
       }
       

       //send team information to the user, main information about the team that the fan sees!
       res.send(`
           <html>
           <head>
               <title>Bandwagon Transfer Approved</title>
               <link rel="preconnect" href="https://fonts.googleapis.com">
               <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
               <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&display=swap" rel="stylesheet">
               <style>
                   body {
                       background-color: #f0f2f5;
                       color: #222;
                       font-size: 16px;
                       font-family: 'Oswald', sans-serif;
                       max-width: 800px;
                       margin: 0 auto;
                       padding: 20px;
                       line-height: 1.6;
                   }
                   h1, h2, h3 {
                       color: #013369;
                       text-align: center;
                       margin-top: 30px;
                   }
                   .success-banner {
                       background-color: #e8f5e9;
                       padding: 20px;
                       border-radius: 10px;
                       margin: 20px 0;
                       text-align: center;
                       box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                   }
                   .team-info {
                       background-color: #fff;
                       border-radius: 10px;
                       padding: 25px;
                       margin: 20px 0;
                       box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                   }
                   .team-header {
                       display: flex;
                       align-items: center;
                       margin-bottom: 20px;
                       justify-content: center;
                   }
                   .team-logo {
                       width: 120px;
                       height: 120px;
                       object-fit: contain;
                       margin-right: 20px;
                   }
                   .team-details {
                       display: grid;
                       grid-template-columns: 1fr 1fr;
                       gap: 20px;
                       margin-top: 20px;
                   }
                   @media (max-width: 600px) {
                       .team-details {
                           grid-template-columns: 1fr;
                       }
                   }
                   .detail-item {
                       background-color: #f9f9f9;
                       padding: 15px;
                       border-radius: 8px;
                       margin-bottom: 15px;
                   }
                   .detail-item strong {
                       display: block;
                       margin-bottom: 5px;
                       color: #013369;
                       font-weight: 600;
                   }
                   .team-banner {
                       width: 100%;
                       height: 180px;
                       object-fit: cover;
                       border-radius: 8px;
                       margin: 20px 0;
                   }
                   .team-description {
                       background-color: #f9f9f9;
                       padding: 20px;
                       border-radius: 8px;
                       margin: 20px 0;
                       line-height: 1.6;
                   }
                   .application-summary {
                       background-color: #f9f9f9;
                       padding: 20px;
                       border-radius: 10px;
                       margin-top: 30px;
                       box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                   }
                   .application-summary p {
                       margin: 8px 0;
                       display: flex;
                       justify-content: space-between;
                   }
                   .application-summary p strong {
                       min-width: 180px;
                   }
                   .action-buttons {
                       display: flex;
                       justify-content: space-between;
                       margin-top: 30px;
                   }
                   .action-button {
                       display: inline-block;
                       padding: 12px 25px;
                       background-color: #013369;
                       color: white;
                       text-decoration: none;
                       border-radius: 5px;
                       text-align: center;
                       flex: 1;
                       margin: 0 10px;
                       transition: background-color 0.3s;
                       font-weight: 500;
                   }
                   .action-button:hover {
                       background-color: #00204e;
                   }
                   .stadium-img {
                       width: 100%;
                       height: 150px;
                       object-fit: cover;
                       border-radius: 8px;
                       margin-top: 10px;
                   }
                   .navbar {
                        padding: 10px 0;
                    }

                    .navbar ul {
                        list-style: none;
                        display: flex;
                        justify-content: right;
                        gap: 40px;
                        margin-right: 0;
                        padding: 0;
                    }

                    .navbar li a {
                        text-decoration: none;
                        font-size: 18px;
                        font-weight: 600;
                        font-family: 'Oswald', sans-serif;
                        transition: color 0.3s ease;
                    }

                    .navbar li a:hover {
                        color: red;
                    } 
               </style>
           </head>
           <body>
                <nav class="navbar">
                    <ul>
                        <li><a href="Application.html">Application Form</a></li>
                        <li><a href="view-applicants.html">View All Applicants</a></li>
                    </ul>
                </nav>
               <h1>NFL Bandwagon Transferral</h1>
               
               <div class="success-banner">
                   <h2>Application Approved!</h2>
                   <p>Congratulations, ${name}! Your bandwagon transfer from ${last_team} to ${new_team} has been approved.</p>
               </div>
               
               <div class="team-info">
                   <h2>Welcome to Your New Team</h2>
                   
                   ${teamInfo.banner ? `<img src="${teamInfo.banner}" alt="${teamInfo.name} Banner" class="team-banner">` : ''}
                   
                   <div class="team-header">
                       <img src="${teamInfo.logo}" alt="${teamInfo.name} Logo" class="team-logo">
                       <div>
                           <h2>${teamInfo.name}</h2>
                           <p><strong>League:</strong> ${teamInfo.league}</p>
                           <p><strong>Founded:</strong> ${teamInfo.founded}</p>
                       </div>
                   </div>
                   
                   <div class="team-details">
                       <div class="detail-item">
                           <strong>Stadium:</strong>
                           <p>${teamInfo.stadium}</p>
                           ${teamInfo.stadiumThumb ? `<img src="${teamInfo.stadiumThumb}" alt="${teamInfo.stadium}" class="stadium-img">` : ''}
                       </div>
                       
                       <div class="detail-item">
                           <strong>Stadium Capacity:</strong>
                           <p>${teamInfo.capacity}</p>
                       </div>
                   </div>
                   
                   <div class="team-description">
                       <strong>About Your New Team:</strong>
                       <p>${teamInfo.description}</p>
                   </div>
               </div>
               
               <div class="application-summary">
                   <h3>Your Application Summary</h3>
                   <p><strong>Name:</strong> <span>${name}</span></p>
                   <p><strong>Age:</strong> <span>${age}</span></p>
                   <p><strong>Previous Team:</strong> <span>${last_team}</span></p>
                   <p><strong>New Team:</strong> <span>${new_team}</span></p>
                   <p><strong>Reason for Transfer:</strong> <span>${reasonText}</span></p>
                   <p><strong>Length of Commitment:</strong> <span>${lengthText}</span></p>
                   <p><strong>Backup Team:</strong> <span>${backup_team}</span></p>
                   <p><strong>Championship Dependent:</strong> <span>${championship_dep}</span></p>
                   <p><strong>Application Date:</strong> <span>${new Date().toLocaleDateString()}</span></p>
               </div>
               
               <div class="action-buttons">
                   <a href="/" class="action-button">Submit Another Application</a>
               </div>
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

//view-applicants.html file
router.get("/view-applicants.html", (req, res) => {
    res.sendFile(path.join(__dirname, "view-applicants.html"));
});

//API endpoint for all applications
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

//API endpoint to remove all applications
router.delete("/api/applications/removeAll", async (req, res) => {
    try {
      await client.connect();
      const database = client.db(dbName);
      const collection = database.collection(collectionName);
      
      const count = await collection.countDocuments({});
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

  router.post("/removeAllApplications", async (req, res) => {
    try {
      await client.connect();
      const col = client.db(dbName).collection(collectionName);
      await col.deleteMany({});
    } catch (e) {
      console.error("Failed to delete all applications:", e);
    } finally {
      await client.close();
    }
    // Redirect back to the listing page
    res.redirect("/view-applicants.html");
  });
  
  router.get("/view-applicants.html", async (req, res) => {
    let applications = [];
    try {
      await client.connect();
      const col = client.db(dbName).collection(collectionName);
      applications = await col
        .find({})
        .sort({ submissionDate: -1 })
        .toArray();
    } catch (e) {
      console.error("Error fetching applications:", e);
    } finally {
      await client.close();
    }
  
    // Build the table rows
    const reasonMap = { A: "Player Transfer", B: "Team Became Unpopular", C: "Team didn't make the Playoffs" };
    const lengthMap = {
      A: "One Season",
      B: "Length of Player's Contract",
      C: "When Team Loses The Playoffs",
      D: "Not Sure (Unstable)"
    };
  
    const rows = applications.map(app => `
      <tr>
        <td>${app.name}</td>
        <td>${app.age}</td>
        <td>${app.lastTeam}</td>
        <td>${app.newTeam}</td>
        <td>${reasonMap[app.reasonForTransfer] || app.reasonForTransfer}</td>
        <td>${app.firstTimeBandWagoner}</td>
        <td>${lengthMap[app.lengthOfCommitment] || app.lengthOfCommitment}</td>
        <td>${app.backupTeam}</td>
      </tr>
    `).join("") || `
      <tr>
        <td colspan="8" style="text-align:center;">No applicants found</td>
      </tr>
    `;
  
    // Send the fully-rendered HTML page
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" />
        <title>View Bandwagon Applicants</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="style.css" />
        <style>
          /* Inline table styles (you can move these into style.css) */
          table { width:100%; border-collapse:collapse; margin-top:20px; }
          th,td { padding:10px; border:1px solid #ccc; text-align:left; }
          th { background:#013369; color:#fff }
          tr:nth-child(even){ background:#f9f9f9 }
        </style>
      </head>
      <body>
        <nav class="navbar">
          <ul>
            <li><a href="/">Application Form</a></li>
            <li><a href="/view-applicants.html">View All Applicants</a></li>
          </ul>
        </nav>
        <h1>NFL BANDWAGON APPLICANTS</h1>
  
        <form class="remove-form" action="/removeAllApplications" method="POST">
          <button type="submit" class="remove-button">Remove All Applications</button>
        </form>
  
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Age</th><th>Last Team</th><th>New Team</th>
              <th>Reason</th><th>First-Timer</th><th>Commitment</th><th>Backup Team</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
      </html>
    `);
  });

router.get("/status", (req, res) => {
    res.json({ status: "Server is running", time: new Date() });
});

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});

