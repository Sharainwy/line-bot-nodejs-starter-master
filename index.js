'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const config = require('./config.json');
const http = require('http'); 
const WebSocket = require('ws');
const client = new line.Client(config);
const app = express();
const server = http.createServer(app); 
const wss = new WebSocket.Server({ server });


async function getProfile(userId) {
  try {
    const profile = await client.getProfile(userId);
    return profile;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
}


// webhook callback
app.post('/webhook', line.middleware(config), (req, res) => {
  // req.body.events should be an array of events
  if (!Array.isArray(req.body.events)) {
    return res.status(500).end();
  }
  // handle events separately
  Promise.all(req.body.events.map(event => {
    console.log('event', event);
    // check verify webhook event
    if (event.replyToken === '00000000000000000000000000000000' ||
      event.replyToken === 'ffffffffffffffffffffffffffffffff') {
      return;
    }
    return handleEvent(event);
  }))
    .then(() => res.end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// app.put('/events', async (req, res) => {
//   const userId = req.params.userId;
//   try {
//     const eventData = {
//       type: req.body.type,
//       message: {},
//       source: {
//         userId: userId,
//       },
//       profile: null,
//     };

//     // Get user profile and store it in eventData
//     eventData.profile = await getProfile(userId);

//     // Find and update the existing document with upsert option
//     await Event.findOneAndUpdate(
//       { 'source.userId': userId },
//       eventData,
//       { upsert: true }
//     );

//     console.log('Sent Data to MongoDB:', eventData);

//     res.status(200).json({
//       status: 'ok',
//       eventData: eventData,
//     });
//   } catch (error) {
//     console.error('Error Send to MongoDB:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'An error occurred while updating the event data.',
//     });
//   }
// });
app.get('/',  (req, res) => {
  try {
    
    res.status(200).send('OK Connect');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
});

// simple reply function
const replyText = (token, texts) => {
  texts = Array.isArray(texts) ? texts : [texts];
  return client.replyMessage(
    token,
    texts.map((text) => ({ type: 'text', text }))
  );
};

// callback function to handle a single event
async function handleEvent(event) {
  try {
    if (event.type === 'beacon') {
      wss.clients.forEach(async (client) => {
        const userProfile = await getProfile(event.source.userId);
  
        const dataToSend = {
          type: 'beacon',
          text: event.beacon.type,
          userId: userProfile.userId,
          displayName: userProfile.displayName,
          pictureUrl: userProfile.pictureUrl,
          statusMessage: userProfile.statusMessage
        };
  
        client.send(JSON.stringify(dataToSend));
      });

      
    }
    } catch (error) {
      console.error('Error handling event and saving to MongoDB:', error);
    }
  
  switch (event.type) {
    case 'message':
      const message = event.message;
      const UserID = event.source.userId;
      const msgtype = event.type;
      const Rev = event.message.type;
      console.log('UserID : ' + UserID + '\nEvent : ' + msgtype + '  type : ' + Rev);
      switch (message.type) {
        case 'text':
          return handleText(message, event.replyToken);
        case 'image':
          return handleImage(message, event.replyToken);
        case 'video':
          return handleVideo(message, event.replyToken);
        case 'audio':
          return handleAudio(message, event.replyToken);
        case 'location':
          return handleLocation(message, event.replyToken);
        case 'sticker':
          return handleSticker(message, event.replyToken);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      }

    case 'follow':
      return replyText(event.replyToken, 'Got followed event');

    case 'unfollow':
      return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);

    case 'join':
      return replyText(event.replyToken, `Joined ${event.source.type}`);

    case 'leave':
      return console.log(`Left: ${JSON.stringify(event)}`);

    case 'postback':
      let data = event.postback.data;
      return replyText(event.replyToken, `Got postback: ${data}`);

    case 'beacon':
      // const dm = `${Buffer.from(event.beacon.dm || '', 'hex').toString('utf8')}`;
      // return replyText(event.replyToken, `${event.beacon.type} beacon hwid : ${event.beacon.hwid} with device message = ${dm}`);
      const beacontype = event.type;
      const beaconUserId = event.source.userId;
      console.log('UserID : ' + beaconUserId + '\nEvent : ' + beacontype + '  type : ' + event.beacon.type);

      return replyText(event.replyToken, 'Hello\nBeacon Status : ' + beacontype);
    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
}

function handleText(message, replyToken) {
  return replyText(replyToken, message.text);
}
function handleImage(message, replyToken) {
  return replyText(replyToken, 'Got Image');
}
function handleVideo(message, replyToken) {
  return replyText(replyToken, 'Got Video');
}
function handleAudio(message, replyToken) {
  return replyText(replyToken, 'Got Audio');
}
function handleLocation(message, replyToken) {
  return replyText(replyToken, 'Got Location');
}
function handleSticker(message, replyToken) {
  return replyText(replyToken, 'Got Sticker');
}

wss.on('connection', (ws) => {
  console.log('WebSocket connected');

  // รับข้อมูลจากหน้าเว็บผ่าน WebSocket และส่งไปยัง LINE Bot
  ws.on('message', async (data) => {
    const message = JSON.parse(data);
    if (message.type === 'beacon') {
      // ขอข้อมูลผู้ใช้จาก LINE Messaging API
      const userProfile = await client.getProfile(message.userId);
      
      // สร้างข้อมูลที่จะส่งกลับไปยังหน้าเว็บ
      const dataToSend = {
        type: 'beacon',
        text: event.beacon.type,
        userId: userProfile.userId,
        displayName: userProfile.displayName,
        pictureUrl: userProfile.pictureUrl,
        statusMessage: userProfile.statusMessage
      };

      // ส่งข้อมูลไปยังหน้าเว็บผ่าน WebSocket
      ws.send(JSON.stringify(dataToSend));
    }
  });
  ws.on('close', () => {
    console.log('WebSocket disconnected');
    // เพิ่มการจัดการเมื่อมีการตัดการเชื่อมต่อ WebSocket ที่นี่
  });
});

const port = config.port;

server.listen(port, () => {
  console.log(`listening on ${port}`);
});
