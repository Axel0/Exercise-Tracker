const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )

var Schema=mongoose.Schema;

var exerciseSchema=new Schema({
  person:String,
  description:String,
  duration:Number,
  date:Date
});

var userSchema=new Schema({
  username:String,
  _userid:Schema.Types.ObjectId,
  exercises: [{ type: Schema.Types.ObjectId, ref: 'exerciseModel' }]
})
var exerciseModel=mongoose.model('exerciseModel',exerciseSchema);
var userModel=mongoose.model('userModel',userSchema);

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/exercise/new-user',function(req,res){
  var username=req.body.username;
  var user=new userModel({_userid:new mongoose.Types.ObjectId(),
                              username:username});
  user.save(function(err){
    if (err) return err;
    res.send(user);
  });
  
});

app.post('/api/exercise/add', function (req,res){
  var userId=req.body.userId;
  var description=req.body.description;
  var duration=req.body.duration;
  var date=req.body.date
  var exercise=new exerciseModel({
    person:userId,
    description:description,
    duration:duration,
    date:date
    
  });
  
  exercise.save(function(err){
    if (err) return err;
    res.send(exercise);
  });
});

app.get('/api/exercise/log', function(req,res){
  var user=Object.keys(req.query)[0]
  
  exerciseModel.find({'person':user}, function(err,docs){
    if (err) return err;
    res.send(docs)
  });
});

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
