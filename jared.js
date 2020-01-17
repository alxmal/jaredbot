const Telegraf = require("telegraf");

const TOKEN = process.env.BOT_TOKEN;
const URL = process.env.URL;
const bot = new Telegraf(TOKEN);

bot.telegram.setWebhook(`${URL}/bot${TOKEN}`);

// Bot actions
bot.on("sticker", ctx => {
	console.log(ctx.message.text);
});

bot.command("gifme", ctx => {
	return ctx.reply("Gif posted.");
});

bot.hears("hi", async ctx => {
	await ctx.reply("Hey!");
});

bot.catch((err, ctx) => {
	console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

module.exports = bot.webhookCallback(`/bot${TOKEN}`);
