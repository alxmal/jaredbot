process.env["NTBA_FIX_319"] = 1;

import TelegramBot from "node-telegram-bot-api";
import config from "config";
import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";

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
	let answer = "Нет команд. Вакабот пока ничего не умеет.";
	bot.sendMessage(id, answer);
});

/* Ответ на /about */
bot.onText(/\/about/, msg => {
	const {
		chat: { id }
	} = msg;
	let answer = "Вакабот заботится о вашем отпуске. Вакабот молодец.";
	bot.sendMessage(id, answer);
});

/* Стикер с медведем в ответ на ругательство */
bot.on("message", msg => {
	const {
		chat: { id }
	} = msg;
	let textInclude = "блядь";
	let stickerId = "CAADAgADkgEAAhmGAwABwd3g-2GZO1wC";
	if (
		msg.text
			.toString()
			.toLowerCase()
			.includes(textInclude)
	) {
		bot.sendSticker(id, stickerId);
	}
});
