const express = require("express");
const bodyParser = require('body-parser');
const {check, validationResult} = require('express-validator');
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require('jsonwebtoken');
//remember to run mongod on the cmd to ensure connection.

const app = express();
app.use(cors());
app.use(express.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

//this is resposible for connection
mongoose.connect("mongodb://localhost:27017/user", {
    useNewUrlParser:true
}).then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

const Schema = mongoose.Schema;

const mySchema = new Schema({
  name: String,
  email: String,
  password: String,
  coins: Number,
  equippedBackground : String,
  equippedAvatar : String,
  activity: [
    {
      month: { type: String, required: true },
      cycles: { type: Number, required: true }
    }
  ],
  listofAvatarsOwned: [
    {
      AvatarId: {type: Number, required: true},
      imgSrc : {type: String, required: true}
    }
  ],
  listofBackgroundsOwned: [
    {
      BackgroundId: {type: Number, required: true},
      imgSrc : {type: String, required: true}
    }
  ]
});

const FormData = mongoose.model('MyModel', mySchema);

// used for sign up
app.post('/api/signup', [
  //validatiors for form info
  check('name', 'Name must be 5+ letters long')
  .exists()
  .isLength({ min: 5 })
  .trim()
  .isAlpha().withMessage('Name must contain only alphabetic characters')
  .isLength({ max: 50 }).withMessage('Name must not exceed 50 characters'),

  
  check('email', 'Email is not valid')
  .isEmail()
  .normalizeEmail()
  .isLength({ max: 100 }).withMessage('Email must not exceed 100 characters'),

  check('password', 'The password is too weak')
  .isStrongPassword()
  .isLength({ min: 5 })
  .custom((value, { req }) => {
    // Additional password complexity checks can be implemented here
    // Example: Check for sequential numbers
    if (value.match(/12345678/)) {
      throw new Error('Password should not contain sequential numbers');
    }
    return true;
  })

], (req,res) => {
  console.log("Request body: ", req.body);

  // Define the months and initialize the activity array
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const activity = months.map(month => ({ month, cycles: 0 }));
  const defaultAvatarSrc = "client/src/avatarImages/defaultAvatar.png";
  const newFormData = new FormData({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    coins: 0,
    activity,
    equippedBackground: "",
    equippedAvatar: defaultAvatarSrc,
    listofAvatarsOwned: [],
    listofBackgroundsOwned: []

  });
  console.log(newFormData);
  const error = validationResult(req);
    if(!error.isEmpty()){
      return res.status(422).send({
        errorArray: error.array()
      });
    }
  //saves data into mongodb
  newFormData.save()
  .then(savedFormData => {
    res.send(savedFormData);
  })
  .catch(err => {
    console.error(err);
    res.status(500).send({
      "error": "Server Error"
   });
  });  
});

//Used for Login
app.post('/api/login',[
  //validatiors for form info
  check('email', 'Email is not valid')
  .exists()
  .isEmail()
  .normalizeEmail()
  .isLength({ max: 100 }).withMessage('Email must not exceed 100 characters'),

  check('password', 'The password is too weak')
  .exists()
  .isStrongPassword()
  .isLength({ min: 8 })


], async (req, res) => {
  const { email, password } = req.body;
  console.log("password ", password);
  try {
    // Check if user with email exists in the database
    const user = await FormData.findOne({ email, password });

    if (!user) {
      return res.status(401).send('Invalid credentials');
    }
    console.log("User ",user);
    const error = validationResult(req);
    if(!error.isEmpty()){
      return res.status(422).send(error);
    }

    // If email and password match, create a JSON web token (JWT) and send it to the client
    const token = jwt.sign({ userId: user._id }, 'secret123');
    const data = {
      name : user.name,
      coins : user.coins,
      JWTtoken : token
    }
    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).send({
          "error": "Server Error"
       });
  }
});
// adding to activity on Save
app.put('/api/documents', async (req, res) => {
  
  const {username, coins, cycleCount, currentMonthIndex} = req.body;
  console.log(username);
  console.log(coins);
  console.log(cycleCount);
  console.log(currentMonthIndex);

  try {
    // Find the document associated with the username
    const formData = await FormData.findOne({ name: username });

    // Update the coins field
    formData.coins += coins;

    // Retrieve the activity array
    const { activity } = formData;
    

    // If the month is found, update the cycles value
    if (currentMonthIndex !== -1) {
      activity[currentMonthIndex].cycles += cycleCount / 2
    }
    console.log(activity);
    // Update the document in the database
    await formData.save();

    return res.status(200).json({ message: 'Data updated successfully' });
  } catch (error) {
    console.error('Error updating document:', error);
    
  }
});

//gets user obj
app.get('/api/documents/:username', async (req, res) => {

  const username = req.params.username;
  const user = await FormData.findOne({name:  username });
  //console.log(user);
  try{

    if(!user){
      res.status(404).send({'error': 'User not found'});
          return;
    }
    res.status(200).send({'user': user});

  }catch(err){
    console.error('Error retrieving document:', err);
    res.status(500).send({"error": 'Error retrieving document'});
  }

  
});

//updates arrays of avatars and backgrounds
app.put('/api/SaveFromStore', async(req,res) => {
  const {username, availableCoins, avatarsOwned, backgroundsOwned} = req.body;

  try{
    // Find the document associated with the username
    console.log(username);
    console.log(avatarsOwned);
    console.log(backgroundsOwned);
    const formData = await FormData.findOne({ name: username });

    if (formData) {
      if (formData.listofAvatarsOwned !== null) {
        for (const avatar of avatarsOwned) {
          console.log('avatar id', avatar.AvatarId)
          formData.listofAvatarsOwned.push({ AvatarId: avatar.AvatarId, imgSrc: avatar.imgSrc });
        }
      } if (formData.listofBackgroundsOwned !== null) {
        for (const background of backgroundsOwned) {
          console.log('background id', background.BackgroundId)
          formData.listofBackgroundsOwned.push({ BackgroundId: background.BackgroundId, imgSrc: background.imgSrc });
        }
      }  if (formData.listofAvatarsOwned.length === 0) {
        
        formData.listofAvatarsOwned = avatarsOwned.map((avatar) => ({ AvatarId: avatar.AvatarId, imgSrc: avatar.imgSrc }));
      } else {
        
        formData.listofBackgroundsOwned = backgroundsOwned.map((background) => ({ BackgroundId: background.BackgroundId, imgSrc: background.imgSrc }));
      }
    }
    formData.coins = availableCoins;
    // Save the updated document to the database
    await formData.save();
    res.status(200).json({ message: 'Data updated successfully' });

  }catch(error){

    console.error('Error updating document:', error);
    res.status(500).json({ message: 'Error updating document' });
  }
});

//updates equipped avatar and background properties
app.put('/api/UpdateFromProfile', async(req,res) => {
  const {username, avatarSrc, backgroundSrc} = req.body;

  try{
    // Find the document associated with the username
    console.log(username);
    console.log(avatarSrc);
    console.log(backgroundSrc);
    const formData = await FormData.findOne({ name: username });

    if (formData) {
      if(avatarSrc === ""){
        formData.equippedBackground = backgroundSrc;
      }else if(backgroundSrc === ""){
        formData.equippedAvatar = avatarSrc;
      } else{
        formData.equippedBackground = backgroundSrc;
        formData.equippedAvatar = avatarSrc;
      }
    }
    
    // Save the updated document to the database
    await formData.save();
    res.status(200).json({ message: 'Data updated successfully' });

  }catch(error){

    console.error('Error updating document:', error);
    res.status(500).json({ message: 'Error updating document' });
  }
});

//creates server
app.listen(3001, () => {
    console.log("on port 3001");
})