const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require("mongodb");
const app = express();
const cors = require('cors')
const port = process.env.PORT || 3000;
const mongoURI = 'mongodb+srv://Sharainwy:Mindbnk48@shar.xu2urv6.mongodb.net/';

app.use(cors())
app.use(express.json());

app.post('/save-profile-data',cors, (req, res) => {
  const data = req.body;

  MongoClient.connect(mongoURI, (err, client) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการเชื่อมต่อกับ MongoDB:', err);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับฐานข้อมูล' });
      return;
    }

    const db = client.db(); // แทน your-database-name ด้วยชื่อฐานข้อมูลของคุณ

    db.collection('profiles').insertOne(data, (err, result) => {
      if (err) {
        console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูลใน MongoDB:', err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลในฐานข้อมูล' });
      } else {
        console.log('บันทึกข้อมูลใน MongoDB สำเร็จ');
        res.status(200).json({ message: 'บันทึกข้อมูลสำเร็จ' });
      }
      client.close();
    });
  });
});

app.post('/users/create',cors , async(req, res) => {
  const user = req.body;
  const client = new MongoClient(mongoURI);
  await client.connect();
  await client.db('mydb').collection('liff-user').insertOne({
    userId: user.userId,
    displayName: user.displayName,
    firstname: user.displayName,
    location: user.location,
    picture: user.picture,
    position: user.position
  });
  await client.close();
  res.status(200).send({
    "status": "ok",
    "message": "User with ID = "+user.displayName+" is created",
    "user": user
  });
})

app.listen(port, () => {
  console.log(`เซิร์ฟเวอร์กำลังรอที่พอร์ต ${port}`);
});
