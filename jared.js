const Telegraf = require("telegraf");
const { Markup, Extra } = Telegraf;
const mongoose = require("mongoose");
const axios = require("axios");
const CronJob = require("cron").CronJob;
const moment = require("moment");
const ChatUser = require("./models/chatuser");

moment.locale("ru");

const bdays = require("./bdays");
const sortedDaysByDate = bdays
	.slice()
	.sort((a, b) => moment(a[2]) - moment(b[2]));

const TOKEN = process.env.BOT_TOKEN;
const URL = process.env.URL;
const DBHOST = process.env.DBHOST;
const DBUSER = process.env.DBUSER;
const DBPWD = process.env.DBPWD;
const DBNAME = process.env.DBNAME;

const bot = new Telegraf(TOKEN);
bot.telegram.setWebhook(`${URL}/bot${TOKEN}`);

/* Utils */
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

/* MongoDB */
let mongoConnectString = `mongodb://${DBUSER}:${DBPWD}@${DBHOST}/${DBNAME}`;
// let mongoConnectString = `mongodb://127.0.0.1:27017`;

console.log(mongoConnectString);

mongoose.connect(mongoConnectString, {
	useNewUrlParser: true,
	useUnifiedTopology: true
	// user: "jared",
	// pass: "BSRT56PV4ftzsdFT",
	// dbName: "jareddb"
});

let db = mongoose.connection;
db.on("connecting", () => console.log("Connecting to DB..."));
db.once("open", () => console.log("Connected to the DB"));
db.on("error", console.error.bind(console, "MongoDB connection error:"));

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

bot.command("rememberme@JaredTheScrumMasterBot", async ctx => {
	const userId = ctx.message.from.id;
	const firstName = await ctx.message.from.first_name;
	const username = await ctx.message.from.username;

	console.log(userId);
	console.log(firstName);
	console.log(username);
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
		`🎉 Ближайший ДР у <b>${
			sortedDaysByDate[smallestIdx][0]
		}</b> – ${moment(sortedDaysByDate[smallestIdx][2]).format(
			"dddd Do MMMM"
		)}, через ${daysFromNow}`,
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
	cronTime: "40 16 * * *",
	onTick: () => {
		// let chatId = -378020872, // sandbox id
		let chatId = -1001471506167, // birthday chat
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
			message = `Привет! 👋\nЧерез ${daysFromNow} день рождения у <b>${name}</b>.\nДавайте кикнем именинника и обсудим подарок.`;
		if (days <= 7) {
			bot.telegram.sendMessage(chatId, message, {
				parse_mode: "HTML",
				disable_notification: true
			});
		}
	},
	start: true,
	timeZone: "Europe/Moscow"
});

module.exports = bot.webhookCallback(`/bot${TOKEN}`);
