const {Telegraf} = require('telegraf'); 
const bot = new Telegraf(process.env);
/* bot.start('start', ctx => {
    console.log(ctx.from)
    bot.telegram.sendMessage(ctx.chat.id, 'hello there! Welcome to my new telegram bot.', {
    })
}); */
bot.start((ctx) =>{ 
    ctx.reply('Welcome Press this command /test');

})
bot.command("test",(ctx)=>{
    ctx.reply("You pressed test this is great")
})
bot.launch();