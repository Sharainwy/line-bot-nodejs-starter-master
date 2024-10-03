const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require("mongodb");
const cors = require('cors');
const app = express();

const port = process.env.PORT || 3000;
const mongoURI = 'mongodb+srv://Sharainwy:Mindbnk48@shar.xu2urv6.mongodb.net/';

app.use(express.json());
app.use(
  cors({
    origin: "https://sharainwy.github.io", 
    
  }));

  app.post('/users/create' , async(req, res) => {
    const user = req.body;
    const client = new MongoClient(mongoURI);
    await client.connect();
  
    // ตรวจสอบว่ามีผู้ใช้ที่มี userId เดียวกันหรือไม่
    const existingUser = await client.db('mydb').collection('liff-user').findOne({ userId: user.userId });
  
    if (existingUser) {
      // ถ้ามี userId ซ้ำให้ทำการอัปเดตข้อมูลของผู้ใช้
      await client.db('mydb').collection('liff-user').updateOne({ userId: user.userId }, {
        $set: {
          displayName: user.displayName,
          firstname: user.firstName,
          location: user.location,
          picture: user.picture,
          position: user.position
        }
      });
  
      await client.close();
      res.status(200).send({
        "status": "ok",
        "message": "User with ID = " + user.displayName + " is updated",
        "user": user
      });
    } else {
      // ถ้าไม่มี userId ให้ทำการเพิ่มข้อมูลผู้ใช้ใหม่
      
        user.userId,
        user.displayName,
        user.displayName,
        user.picture,
        user.position
    };

      // else {
      // // ถ้าไม่มี userId ให้ทำการเพิ่มข้อมูลผู้ใช้ใหม่
      // await client.db('mydb').collection('liff-user').insertOne({
      //   userId: user.userId,
      //   displayName: user.displayName,
      //   firstname: user.firstName,
      //   location: user.location,
      //   picture: user.picture,
      //   position: user.position
      // });
  
      await client.close();
      res.status(200).send({
        "status": "ok",
        "message": "User with ID = " + user.displayName + " is created",
        "user": user
      });
    }
  })

app.get('/users/:userId', async (req, res) => {
  const userId = req.params.userId;
  const client = new MongoClient(mongoURI);

  try {
    await client.connect();
    const user = await client.db('mydb').collection('liff-user').findOne({ userId: userId });

    if (user) {
      res.status(200).json({
        "status": "ok",
        "user": user
      });
    } else {
      res.status(404).json({
        "status": "error",
        "message": "ไม่พบข้อมูลผู้ใช้"
      });
    }
  } catch (error) {
    console.error('มีข้อผิดพลาดในการดึงข้อมูลผู้ใช้จาก MongoDB:', error);
    res.status(500).json({
      "status": "error",
      "message": "มีข้อผิดพลาดในการดึงข้อมูลผู้ใช้"
    });
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`เซิร์ฟเวอร์กำลังรอที่พอร์ต ${port}`);
});



