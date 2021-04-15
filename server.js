const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000


const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
var bodyParser = require('body-parser');

const SCOPES = ['https://www.googleapis.com/auth/drive'];

const TOKEN_PATH = 'token.json';

var cors = require('cors');
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'))

let auth;

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(content));
});

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

function authorize(credentials) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client);
    oAuth2Client.setCredentials(JSON.parse(token));
    auth = oAuth2Client;
  });
}

function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      auth = authoAuth2Client;
    });
  });
}

app.post('/api/authenticate', (req, res) => {


    res.json({   
        success: true,
        message: "Authentication successful.",
        token: TOKEN_PATH.access_token,
        user: {}
    });
});  

app.post('/api/files', async (req, res) => {
  var fileMetadata = {
    name: 'kamal-hossain', // file name that will be saved in google drive
  };

  console.log(req.body.searchTerm ,'req')

  var media = {
    mimeType: 'image/jpg',
    body: fs.createReadStream('./hex-loader2.gif'), // Reading the file from our server
  };

  // Authenticating drive API
  const drive = google.drive({ version: 'v3', auth });
  searchTerm = req.body.searchTerm;

  //const drive = google.drive({version: 'v3', auth});
  await drive.files.list({
    pageSize: 20,
    q: "fullText contains '" + searchTerm + "'",
    fields: "files(id, webContentLink, webViewLink, thumbnailLink, name)",
    spaces: "drive"
  }, (err, ress) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = ress.data.files;
    if (files.length) {
      /*
      console.log('Files:');
      files.map((file) => {
        console.log(`${file.name} (${file.id})`);
      });
      */
      //res.setHeader('Content-Type', 'application/json');
      res.json({   
            success: true,
            message: 'Successful file lookup.',
            data: files
      });
    } else {
      res.send('No files found.');
    }
  });

  // Uploading Single image to drive
  /*
  drive.files.create(
    {
      resource: fileMetadata,
      media: media,
    },
    async (err, file) => {
    	console.log(err,file)
      if (err) {
        // Handle error
        console.error(err.msg);

        return res
          .status(400)
          .json({ errors: [{ msg: 'Server Error try again later' }] });
      } else {
        // if file upload success then return the unique google drive id
        res.status(200).json({
          fileID: file.data.id,
        });
      }
    }
  );
  */

});

app.get('/testRoute', (req, res) => res.end('Hello from Server!'));

app.listen(PORT, () => {
  console.log(`Node.js App running on port ${PORT}...`);
});