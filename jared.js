const Telegraf = require("telegraf");
const { Markup, Extra } = Telegraf;
const axios = require("axios");
const CronJob = require("cron").CronJob;
const moment = require("moment");

moment.locale("ru");

const bdays = require("./bdays");

let sortedDaysByDate = bdays
	.slice()
	.sort((a, b) => moment(a[2]) - moment(b[2]));

const TOKEN = process.env.BOT_TOKEN;
const URL = process.env.URL;
const bot = new Telegraf(TOKEN);

// Utils
const getClosestDatesValues = arr => {
	return arr.map(item => {
		let now = moment(),
			bday = moment(item[2]);
		return bday.diff(now, "days");
	});
};

const getClosestDateIndex = arr => {
	return arr.indexOf(Math.min(...arr.filter(item => item > 0)));
};

bot.telegram.setWebhook(`${URL}/bot${TOKEN}`);

/* Bot actions */

bot.command("heyjared@JaredTheScrumMasterBot", async ctx => {
	const username = await ctx.message.from.first_name;
	const result = await ctx.reply(
		`Чем могу помочь ${username}?`,
		Markup.inlineKeyboard([
			Markup.callbackButton("🥳 Все ДР", "bdlist"),
			Markup.callbackButton("🎁 Следующий", "nextbd")
		]).extra()
	);
	return result;
});

bot.action("bdlist", async (ctx, next) => {
	const getList = arr => {
		let birthdayList = "";
		arr.forEach(item => {
			let now = moment(),
				isAfter = moment(item[2]).isAfter(now, "month"),
				listAfterRow = `<b>${item[0]}</b> ${item[1]} – ${moment(
					item[2]
				).format("dddd Do MMMM")} \n ---------- \n`,
				listBeforeRow = `☑️ <i>${item[0]}</i> ${item[1]} – <s>${moment(
					item[2]
				).format("dddd Do MMMM")}</s> \n ---------- \n`;

			birthdayList += isAfter ? listAfterRow : listBeforeRow;
		});
		return birthdayList;
	};

	return ctx
		.replyWithHTML(getList(sortedDaysByDate), {
			disable_notification: true
		})
		.then(() => next());
});

bot.action("nextbd", async (ctx, next) => {
	let nearestDates = getClosestDatesValues(sortedDaysByDate),
		closestIdx = getClosestDateIndex(nearestDates),
		daysFromNow = moment(sortedDaysByDate[closestIdx][2]).toNow("dd hh");

	ctx.replyWithHTML(
		`🎉 <b>${sortedDaysByDate[smallestIdx][0]}</b> – ${moment(
			sortedDaysByDate[smallestIdx][2]
		).format("dddd Do MMMM")}, через ${daysFromNow}`,
		{
			disable_notification: true
		}
	).then(() => next());
});

bot.hears(["hi", "привет", "Привет"], async ctx => {
	const username = await ctx.message.from.first_name;
	const result = await ctx.reply(`Привет ${username}`, {
		disable_notification: true
	});
	return result;
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
	await ctx.reply(getMessage(), { disable_notification: true });
});

bot.on("message", ctx => {
	console.log(ctx.message.text);
	console.log(ctx.message);
});

bot.catch((err, ctx) => {
	console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

/* Cron Jobs */

let checkBirthday = new CronJob({
	// cronTime: "00 00 12 * * *",
	cronTime: "00 17 * * *",
	onTick: () => {
		let chatId = -378020872,
			nearestDates = getClosestDatesValues(sortedDaysByDate),
			closestIdx = getClosestDateIndex(nearestDates),
			daysFromNow = moment(sortedDaysByDate[closestIdx][2]).toNow(
				"dd hh"
			),
			name = sortedDaysByDate[closestIdx][0],
			nextBday = sortedDaysByDate[closestIdx][2];

		const checkNextBday = () => {
			let now = moment(),
				next = moment(nextBday),
				daysToNext = next.diff(now, "days");

			return daysToNext;
		};

		let days = checkNextBday(),
			message = `<<<<TEST CRONJOB>>>> Привет! 👋\nЧерез ${daysFromNow} день рождения у <b>${name}</b>.\nДавайте обсудим подарок.`;
		// if (days <= 7)
		bot.telegram.sendMessage(chatId, message, {
			parse_mode: "HTML",
			disable_notification: true
		});
	},
	start: true,
	timeZone: "Europe/Moscow"
});

module.exports = bot.webhookCallback(`/bot${TOKEN}`);
