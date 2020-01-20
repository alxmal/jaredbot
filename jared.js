const Telegraf = require("telegraf");
const { Extra } = Telegraf;
const Markup = require("telegraf/markup");
const axios = require("axios");

const TOKEN = process.env.BOT_TOKEN;
const URL = process.env.URL;
const bot = new Telegraf(TOKEN);

bot.telegram.setWebhook(`${URL}/bot${TOKEN}`);

// Bot actions

bot.command("help", async ctx => {
	const chatId = await ctx.chat.id;
	console.log(chatId);
	const result = await ctx.replyWithAnimation(
		chatId,
		"https://media.giphy.com/media/ya4eevXU490Iw/giphy.gif"
	);
	return result;
});

bot.hears(["hi", "привет", "Привет"], async ctx => {
	const username = await ctx.message.from.username;
	const result = await ctx.reply(`Привет ${username}`);
	return result;
});

bot.hears(/\/wrap (\d+)/, ctx => {
	return ctx.reply(
		"Keyboard wrap",
		Extra.markup(
			Markup.keyboard(["one", "two", "three", "four", "five", "six"], {
				columns: parseInt(ctx.match[1])
			})
		)
	);
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

// bot.on("inline_query", async ctx => {
// 	let query = ctx.update.inline_query.query;
// 	console.log(query);

// 	if (query.startsWith("/")) {
// 		if (query.startsWith("/help")) {
// 			console.log("HELP");
// 			ctx.reply("Джаред помогает.");
// 		}
// 	}
// });

bot.on("inline_query", async ({ inlineQuery, answerInlineQuery }) => {
	try {
		const apiUrl = `http://recipepuppy.com/api/?q=${inlineQuery.query}`;
		const response = await axios.get(apiUrl);
		const { results } = await response.data;

		console.log(results);

		const recipes = results
			.filter(({ thumbnail }) => thumbnail)
			.map(({ title, href, thumbnail }) => ({
				type: "article",
				id: thumbnail,
				title: title,
				description: title,
				thumb_url: thumbnail,
				input_message_content: {
					message_text: title
				},
				reply_markup: Markup.inlineKeyboard([
					Markup.urlButton("Go to recipe", href)
				])
			}));
		return answerInlineQuery(recipes);
	} catch (error) {
		console.error(error);
	}
});

bot.on("chosen_inline_result", ({ chosenInlineResult }) => {
	console.log("chosen inline result", chosenInlineResult);
});

bot.on("message", ctx => {
	console.log(ctx.message.text);
	console.log(ctx);
});

bot.catch((err, ctx) => {
	console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

module.exports = bot.webhookCallback(`/bot${TOKEN}`);
