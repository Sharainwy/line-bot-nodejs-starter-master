const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const mongoURI = 'mongodb+srv://Sharainwy:Mindbnk48@shar.xu2urv6.mongodb.net/';

app.use(bodyParser.json());

app.use(cors({
  origin: 'https://linebeacon.000webhostapp.com', // แทนด้วย origin ของเว็บไซต์ที่คุณต้องการอนุญาตให้เรียกใช้งาน API ของคุณ
}));



app.post('/save-profile-data', (req, res) => {
  const data = req.body;

  MongoClient.connect(mongoURI, (err, client) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการเชื่อมต่อกับ MongoDB:', err);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับฐานข้อมูล' });
      return;
    }

    const db = client.db('test'); // แทน your-database-name ด้วยชื่อฐานข้อมูลของคุณ

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

app.listen(port, () => {
  console.log(`เซิร์ฟเวอร์กำลังรอที่พอร์ต ${port}`);
});
