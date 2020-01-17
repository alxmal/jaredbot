const Telegraf = require("telegraf");

const TOKEN = process.env.BOT_TOKEN;
const URL = process.env.URL;
const bot = new Telegraf(TOKEN);

bot.telegram.setWebhook(`${URL}/bot${TOKEN}`);

// Bot actions

bot.hears(["hi", "привет", "Привет"], async ctx => {
	const username = ctx.message.from.username;
	await ctx.reply(`Привет ${username}`);
});

bot.mention("JaredTheScrumMasterBot", async ctx => {
	let answers = [
		"Что? Нихуя не понимаю... 🤷‍♂️",
		"Вгляните на меня, я являюсь частью чего-то доселе невиданного!",
		"Лесбиянство арахисового масла",
		"Как насчёт загадки?"
	];
	const getMessage = () =>
		answers[Math.floor(Math.random() * answers.length)];
	await ctx.reply(getMessage());
});

bot.command("gifme", async ctx => await ctx.reply("Gif posted."));

bot.on("inline_query", async ctx => {
	let query = ctx.update.inline_query.query;
	console.log(query);
});

bot.on("message", ctx => {
	console.log(ctx.message.text);
	console.log(ctx.message);
});

bot.catch((err, ctx) => {
	console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

module.exports = bot.webhookCallback(`/bot${TOKEN}`);
