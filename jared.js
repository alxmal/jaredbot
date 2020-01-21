const Telegraf = require("telegraf");
const { Markup, Extra } = Telegraf;
const axios = require("axios");
const moment = require("moment");

moment.locale("ru");

const bdays = require("./bdays");

let sortedBdays = bdays.slice().sort((a, b) => moment(a[2]) - moment(b[2]));

const TOKEN = process.env.BOT_TOKEN;
const URL = process.env.URL;
const bot = new Telegraf(TOKEN);

bot.telegram.setWebhook(`${URL}/bot${TOKEN}`);

// Bot actions

// bot.command("heyjared@JaredTheScrumMasterBot", async ctx => {
// 	const username = await ctx.message.from.username;
// 	const result = await ctx.reply(
// 		`Чем могу помочь ${username}?`,
// 		Markup.keyboard([
// 			["🥳 Покажи список дней рождения"],
// 			["🎁 У кого следующая днюха?"]
// 		])
// 			.oneTime()
// 			.resize()
// 			.selective()
// 	);
// 	return result;
// });

bot.command("heyjared@JaredTheScrumMasterBot", async ctx => {
	const username = await ctx.message.from.first_name;
	const result = await ctx.reply(
		`Чем могу помочь ${username}?`,
		Markup.inlineKeyboard([
			Markup.callbackButton("🥳 Покажи список ДР", "bdlist"),
			Markup.callbackButton("🎁 Кто следующий?", "nextbd")
		]).extra()
	);
	return result;
});

bot.action("bdlist", async (ctx, next) => {
	const getList = arr => {
		let birthdayList = "";
		arr.forEach(item => {
			let now = moment().format("MM-DD"),
				isAfter = moment(moment(item[2]).format("MM-DD")).isAfter(
					now,
					"month"
				),
				listAfterRow = `<b>${item[0]}</b> ${item[1]} – ${moment(
					item[2]
				).format("dddd Do MMMM")} \n ---------- \n`,
				listBeforeRow = `☑️ <i>${item[0]}</i> ${item[1]} – <s>${moment(
					item[2]
				).format("dddd Do MMMM")}</s> \n ---------- \n`;

			console.log(now, isAfter);

			birthdayList += isAfter ? listAfterRow : listBeforeRow;
		});
		return birthdayList;
	};

	return ctx
		.replyWithHTML(getList(sortedBdays), {
			disable_notification: true
		})
		.then(() => next());
});

bot.action("nextbd", async (ctx, next) => {
	// const getNearestDateIndex = arr => {
	// 	return arr.map(item => {
	// 		let now = moment(moment().format("MM-DD")),
	// 			bday = moment(moment(item[2]).format("MM-DD"));
	// 		return bday.diff(now, "days");
	// 	});
	// };

	// let diffIdxArr = getNearestDateIndex(sortedBdays);

	// const indexOfSmallest = arr => {
	// 	return arr.indexOf(Math.min.apply(Math, arr));
	// };

	// console.log(diffIdxArr);

	// let smallestIdx = diffIdxArr.indexOf(diffIdxArr.filter(item => item > 0).sort()[0]);

	// console.log(smallestIdx);

	let nextDay = sortedBdays
		.map(day => {
			return moment(moment(day[2]).format("MM-DD"));
		})
		.find(m => m.isAfter());

	console.log(nextDay);

	if (nextDay) {
		console.log(`Next is - ${nextDay}, which is ${nextDay.fromNow()}`);
	} else {
		console.log("No next event");
	}

	ctx.reply("🎉 Скоро день рождения у юзер2", {
		disable_notification: true
	}).then(() => next());
});

bot.hears(["hi", "привет", "Привет"], async ctx => {
	const username = await ctx.message.from.first_name;
	const result = await ctx.reply(`Привет ${username}`);
	return result;
});

bot.hears(["Эй, Джаред"], async ({ reply, message }) => {
	const username = await message.from.first_name;
	const result = await reply(
		`Чем могу помочь ${username}?`,
		Markup.keyboard([
			["🥳 Покажи список дней рождения"],
			["🎁 У кого следующая днюха?"]
		])
			.oneTime()
			.resize()
			.selective()
	);
	return result;
});

// bot.hears("🥳 Покажи список дней рождения", async ctx => {
// 	const getList = arr => {
// 		let birthdayList = "";
// 		arr.forEach(item => {
// 			let now = moment().format("MM-DD"),
// 				isAfter = moment(moment(item[2]).format("MM-DD")).isAfter(
// 					now,
// 					"month"
// 				),
// 				listAfterRow = `<b>${item[0]}</b> ${item[1]} – ${moment(
// 					item[2]
// 				).format("dddd Do MMMM")} \n ---------- \n`,
// 				listBeforeRow = `☑️ <i>${item[0]}</i> ${item[1]} – <s>${moment(
// 					item[2]
// 				).format("dddd Do MMMM")}</s> \n ---------- \n`;

// 			console.log(now, isAfter);

// 			birthdayList += isAfter ? listAfterRow : listBeforeRow;
// 		});
// 		return birthdayList;
// 	};

// 	return ctx.replyWithHTML(getList(sortedBdays), {
// 		disable_notification: true
// 	});
// });

// bot.hears("🎁 У кого следующая днюха?", ctx => {
// 	const getNearestDateIndex = arr => {
// 		return arr.map(item => {
// 			let now = moment(moment().format("MM-DD")),
// 				bday = moment(moment(item[2]).format("MM-DD"));
// 			return bday.diff(now, "days");
// 		});
// 	};

// 	let diffIdxArr = getNearestDateIndex(sortedBdays);

// 	const indexOfSmallest = arr => {
// 		return arr.indexOf(Math.min.apply(Math, arr));
// 	};

// 	console.log(diffIdxArr);

// 	let smallestIdx = indexOfSmallest(diffIdxArr);

// 	console.log(smallestIdx);

// 	ctx.reply("🎉 Скоро день рождения у юзер2", { disable_notification: true });
// });

bot.mention("JaredTheScrumMasterBot", async ctx => {
	let answers = [
		"Что? Нихуя не понимаю... 🤷‍♂️",
		"Вгляните на меня, я являюсь частью чего-то доселе невиданного!",
		"Лесбиянство арахисового масла",
		"Как насчёт загадки?"
	];
	const getMessage = () =>
		answers[Math.floor(Math.random() * answers.length)];
	await ctx.reply(getMessage(), { disable_notification: true });
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

// bot.on("inline_query", async ({ inlineQuery, answerInlineQuery }) => {
// 	try {
// 		const apiUrl = `http://recipepuppy.com/api/?q=${inlineQuery.query}`;
// 		const response = await axios.get(apiUrl);
// 		const { results } = await response.data;

// 		console.log(results);

// 		const recipes = results
// 			.filter(({ thumbnail }) => thumbnail)
// 			.map(({ title, href, thumbnail }) => ({
// 				type: "article",
// 				id: thumbnail,
// 				title: title,
// 				description: title,
// 				thumb_url: thumbnail,
// 				input_message_content: {
// 					message_text: title
// 				},
// 				reply_markup: Markup.inlineKeyboard([
// 					Markup.urlButton("Go to recipe", href)
// 				])
// 			}));
// 		return answerInlineQuery(recipes);
// 	} catch (error) {
// 		console.error(error);
// 	}
// });

// bot.on("chosen_inline_result", ({ chosenInlineResult }) => {
// 	console.log("chosen inline result", chosenInlineResult);
// });

bot.on("message", ctx => {
	console.log(ctx.message.text);
	console.log(ctx.message);
});

bot.catch((err, ctx) => {
	console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

module.exports = bot.webhookCallback(`/bot${TOKEN}`);
