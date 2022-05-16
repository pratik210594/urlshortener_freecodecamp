/////////////
//LIBRARIES///////////////////////////////////////////////////////////////
/////////////

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const vu = require("valid-url");
const mongo = require("mongodb");
const mongoose = require("mongoose");
const bp = require("body-parser");
const sid = require("shortid");
app.use(bp.urlencoded({ extended: false }));
app.use(bp.json());
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

/////////////
//VARIABLES///////////////////////////////////////////////////////////////
/////////////

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function() {
    console.log("Connected to database.");
  });

const Schema = mongoose.Schema;
const urlSchema = new Schema({
  original_url: String,
  short_url: String
});
const ShortUrl = mongoose.model("ShortURL", urlSchema);

/////////////
//SECTION 1///////////////////////////////////////////////////////////////
/////////////

//Starting view 
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

//This is the get function that allows us to redirect to links
app.get('/api/shorturl/:short', function(req, res) {
  ShortUrl.find({short_url: req.params.short}).then(function (docs) {
    res.redirect(docs[0].original_url);
  });
});

//This is the post function that allows us to receive links
app.post("/api/shorturl", function (req, res) {
  const url = vu.isWebUri(req.body.url);
  if (url != undefined) {
    let id = sid.generate();

    let newUrl = new ShortUrl({
      original_url: url,
      short_url: id,
    });
    newUrl.save(function (err, doc) {
      if(err) return console.error(err);
      res.json({
        original_url: newUrl.original_url,
        short_url: newUrl.short_url
      });
    });
  }
  else {
    res.json({"error":"invalid URL"});
  }
});

//Set the server port to whatever port is defined and make sure to be using cross-origin for testing
app.listen(3000, function() {console.log(`Listening on port 3000`)});