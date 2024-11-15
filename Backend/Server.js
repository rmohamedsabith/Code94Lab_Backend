// to load environment variables from .env file to process.env object
require('dotenv').config()
const path=require('path')
const cors=require('cors')
const {logger, logEvents}=require('./middleware/logger')
const errorHandler=require('./middleware/errorHandler')
const DBconnect=require('./config/DB')
const mongoose=require('mongoose')
const cookieParser = require('cookie-parser')
const express = require('express');
const bodyParser=require('body-parser')
const http = require('http');

const app = express();

DBconnect()

const PORT=process.env.PORT



//to send data to server in a JSON format
app.use(express.json())
//to use cookie object in the req
app.use(cookieParser())
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  }, express.static(path.join(__dirname, 'uploads')));

  const corsOptions = {
    origin: "http://localhost:3000", // Specify your frontend's origin
    credentials: true, // This is required to handle cookies or credentials in requests
  };
  
  app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
  });
  app.use(cors(corsOptions));
  


//to save the error and the response
app.use(logger)

app.use('/', require('./routes/root'))
app.use('/Vendor',require('./routes/products'))
app.use('/Vendor',require('./routes/favorite'))


app.all('/*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'view', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' })
    } else {
        res.type('txt').send('404 Not Found')
    }
})

app.use(errorHandler)

const server = http.createServer(app);
mongoose.connection.once('open',()=>{
    console.log('Connect to mongoDB')
    server.listen(PORT,()=>{
        console.log(`Server is running on ${PORT}`)
    })
})

mongoose.connection.on('error',(err)=>{
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})