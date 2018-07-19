process.env["NTBA_FIX_319"] = 1;

import TelegramBot from "node-telegram-bot-api";
import config from "config";
import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import fetch from "node-fetch";

const TOKEN = config.get("token");
const PORT = config.get("port");
const bot = new TelegramBot(TOKEN);
bot.setWebHook(`${config.get("url")}/bot`);

const app = new Koa();
const router = Router();

router.post("/bot", ctx => {
	const { body } = ctx.request;
	bot.processUpdate(body);
	ctx.status = 200;
});

app.use(bodyParser());
app.use(router.routes());

app.listen(PORT, () => {
	console.log(`Listening on ${PORT}`);
});

/* Отладка */
bot.on("message", msg => {
	const {
		chat: { id }
	} = msg;
	console.log(msg);
});

/* Ответ на /help */
bot.onText(/\/help/, msg => {
	const {
		chat: { id }
	} = msg;
	let answer = "Джаред пока ничего не умеет 😕";
	bot.sendMessage(id, answer);
});

/* Ответ на /about */
bot.onText(/\/about/, msg => {
	const {
		chat: { id }
	} = msg;
	let answer =
		"Джаред скрам-мастер от бога. Он поможет с любым вопросом и решит любую проблему. Просто спроси у Джареда!";
	bot.sendMessage(id, answer);
});

// /* Стикер с медведем в ответ на ругательство */
// bot.on("message", msg => {
// 	const {
// 		chat: { id },
// 		text
// 	} = msg;
// 	let textInclude = "блядь";
// 	let stickerId = "CAADAgADkgEAAhmGAwABwd3g-2GZO1wC";
// 	if (
// 		text &&
// 		text
// 			.toString()
// 			.toLowerCase()
// 			.includes(textInclude)
// 	) {
// 		bot.sendSticker(id, stickerId);
// 	}
// });

/* Стикер с Путиным в ответ на упоминание */
bot.on("message", msg => {
	const {
		chat: { id },
		text
	} = msg;
	let textInclude = "путин";
	let stickerId = "CAADAgADdwEAAp6c1AXSYeGRV6WhyAI";
	if (
		text &&
		text
			.toString()
			.toLowerCase()
			.includes(textInclude)
	) {
		bot.sendSticker(id, stickerId);
	}
});

/* Отправить рандомную гифку с giphy api */
// bot.on("message", msg => {
// 	const {
// 		chat: { id },
// 		text
// 	} = msg;
// 	const giphy = {
// 		baseURL: "https://api.giphy.com/v1/gifs/",
// 		key: config.get("giphy_key"),
// 		tag: "fail",
// 		type: "random",
// 		rating: "pg-13"
// 	};
// 	let gifURL = encodeURI(
// 		giphy.baseURL + giphy.type + "?api_key=" + giphy.key
// 	);
// 	let textInclude = "Джаред дай гифку";

// 	request(gifURL, function(error, response, body) {
// 		if (!error && response.statusCode == 200) {
// 			let data = JSON.parse(body);
// 			if (
// 				text &&
// 				text
// 					.toString()
// 					.toLowerCase()
// 					.includes(textInclude)
// 			) {
// 				bot.sendDocument(id, data.data.images.downsized_large.url);
// 			}
// 		}
// 	});
// });

bot.onText(/\/gifme/, msg => {
	const {
		chat: { id },
		text
	} = msg;
	const giphy = {
		baseURL: "https://api.giphy.com/v1/gifs/",
		key: config.get("giphy_key"),
		tag: "fail",
		type: "random",
		rating: "pg-13"
	};
	let gifURL = encodeURI(
		giphy.baseURL + giphy.type + "?api_key=" + giphy.key
	);

	// request(gifURL, function(error, response, body) {
	// 	if (!error && response.statusCode == 200) {
	// 		let data = JSON.parse(body);
	// 		bot.sendDocument(id, data.data.images.downsized_large.url);
	// 	}
	// });
	try {
		const res = await fetch(url);
		const data = await res.json();
		bot.sendDocument(id, data.data.images.downsized_large.url);
	} catch (err) {
		console.log(err);
	}
});

// const getAsyncURL = async url => {
	
// };
