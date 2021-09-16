const {Telegraf} = require('telegraf');
const fs = require('fs');
const request = require('request');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();
const {Token}=process.env;
const bot = new Telegraf(Token);
const express=require('express');
const app=express();
const session = require('express-session');
var sess={
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    resave: false 
};
app.use(session(sess));
app.use(function (req, res, next) {
    if (!req.session.views) {
      req.session.views = {}
    }
  
    // get the url pathname
    var pathname = parseurl(req).pathname
  
    // count the views
    req.session.views[pathname] = (req.session.views[pathname] || 0) + 1
  
    next()
  })
bot.start((ctx) =>{ 
    var userdata=ctx.from;
  //  sess=bot.session;
    sess.first_name=userdata.first_name;
    sess.last_name=userdata.last_name;
    console.log(sess);
    ctx.reply('Welcome '+userdata.first_name+' '+userdata.last_name +' how can we help you');
    bot.telegram.sendMessage(ctx.chat.id, 'Please choose on of the following services so we can help you ', {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Shipment Tracking', callback_data: 'ShipmentTracking' },
                    { text: 'Delivery Location', callback_data: 'DeliveryLocation' }
                ],
                
                [
                    { text: 'Product Physical Status', callback_data: 'PhysicalStatus' },
                    { text: 'Product Price', callback_data: 'ProductPrice' }
                ]
            ]
        }
    })
})
bot.action("ShipmentTracking",(ctx)=>{
    ctx.reply("Your Order is on the way ");
})
bot.action("DeliveryLocation",(ctx)=>{
    ctx.reply("Please provide us with your location");
})
bot.on("location",(ctx)=>{
    sess.Location=ctx.update.message.location;
})
bot.action("PhysicalStatus",(ctx)=>{
    bot.telegram.sendMessage(ctx.chat.id, 'What is your product status', {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Damaged Product', callback_data: 'damaged' },
                    { text: 'Great Status', callback_data: 'notdamaged' }
                ]
            ]
        }
    })
})
bot.action("damaged",(ctx)=>{
    ctx.reply("Please upload a photo to your product");
})
const download = (url, path, callback) => {
    request.head(url, (err, res, body) => {
    request(url).pipe(fs.createWriteStream(path)).on('close', callback);
  });
};
bot.on('text',(ctx)=>{
    console.log(ctx);
    
    /* ctx.session.counter++
    console.log(`Message counter:${ctx.session.counter}`); */
})
bot.on('photo',async (ctx)=>{
  
    var fileId=ctx.update.message.photo[1].file_id;
   /*  ctx.telegram.getFileLink(photoid).then(url => {    
        console.log(url);
        var urlLocation=url.href;
        axios({urlLocation, responseType: 'stream'}).then(response => {
            return new Promise((resolve, reject) => {
                response.data.pipe(fs.createWriteStream(`${config.basePath}/src/${ctx.update.message.from.id}.jpg`))
                        
                    });
                })
    }) */
    const res = await fetch(
        `https://api.telegram.org/bot${Token}/getFile?file_id=${fileId}`
      );
      // extract the file path
      const res2 = await res.json();
      const filePath = res2.result.file_path;
  
      // now that we've "file path" we can generate the download link
      const downloadURL = 
        `https://api.telegram.org/file/bot${Token}/${filePath}`;
  
      // download the file (in this case it's an image)
      download(downloadURL, path.join(__dirname,"src", `${fileId}.jpg`), () =>
        console.log('Done!')
       );
       sess.Image={ServerURL:downloadURL,
        LocalURL:path.join(__dirname,"src", `${fileId}.jpg`)};
       console.log(sess);
})
bot.launch();