var express = require('express');
var ejs = require('ejs');
var bodyParser = require('body-parser')

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/bnb_test',
});

var app = express();
// body parser setup
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
// end body parser setup

app.use(express.static(__dirname + '/public'));

app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views');

app.get('/', function(request, response) {
  response.redirect('/properties')
 // response.render('index', { title: 'Hey', message: 'Somayeh' })
});

app.get('/properties', function(request, response) {
  pool.connect(function(err, client, done) {
    if (err) {
      throw err;
    } else {
      client.query('SELECT * FROM bnb_properties;', function(err, res) {
        if (err) {
          console.log(err.stack);
        } else {
          //console.log(res.rows);
          response.render('properties', {results: res.rows})
        };
      });
    }
  })
});

app.get('/add_property', function(request, response) {
  response.render('add_property')
});

app.post('/add_property_to_database', function(request, response) {
  var imgsrc = request.body.imgsrc;
  var description = request.body.description;
  var queryString = `INSERT INTO bnb_properties(imgsrc, description) VALUES
  ('${imgsrc}', '${description}')`;
  pool.connect(function(err, client, done) {
    if (err) {
      throw err;
    } else {
      client.query(queryString, function(err, res) {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(queryString + ' sucessful!')
        };
      });
    }
  })
  response.redirect('/properties')
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
