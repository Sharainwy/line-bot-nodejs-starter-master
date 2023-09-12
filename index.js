/* eslint-disable no-path-concat */
const express = require('express');
const mongoose = require('mongoose');
const app = express();
// eslint-disable-next-line no-unused-vars
const bodyParser = require('body-parser');
const port = 3000;

// เชื่อมต่อกับ MongoDB Atlas
mongoose.connect('mongodb+srv://Sharainwy:Mindbnk48@shar.xu2urv6.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.urlencoded({ extended: true }));

const formDataSchema = {
  name: String,
  email: String,
};

const FormData = mongoose.model('FormData', formDataSchema);

app.get('/', function(req, res) {
  res.sendFile(__dirname + 'https://github.com/Sharainwy/line-bot-nodejs-starter-master/blob/main/index.html');
});

// รับข้อมูลจากแบบฟอร์มและบันทึกลงใน MongoDB
app.post('/', (req, res) => {
  let newformData = new FormData({
    name: req.body.name,
    email: req.body.email,
  });

  newformData.save();
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`เซิร์ฟเวอร์ทำงานที่ http://localhost:${port}`);
});
