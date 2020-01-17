const Telegraf = require("telegraf");

const TOKEN = process.env.BOT_TOKEN;
const URL = process.env.URL;
const bot = new Telegraf(TOKEN);

bot.telegram.setWebhook(`${URL}/bot${TOKEN}`);

// Bot actions

bot.inlineQuery("gifme", ctx => ctx.reply("Gif posted."));

bot.hears(["hi", "привет", "Привет"], async ctx => {
	console.log(ctx);
	await ctx.reply("Привет");
});

bot.mention("JaredTheScrumMasterBot", ctx => {
	ctx.reply("Что? Нихуя не понимаю... 🤷‍♂️");
});

bot.on("inline_query", ctx => {
	let query = ctx.update.inline_query.query;
});

bot.on("message", ctx => {
	console.log(ctx.message.text);
	console.log(ctx.message);
});

bot.catch((err, ctx) => {
	console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

module.exports = bot.webhookCallback(`/bot${TOKEN}`);
