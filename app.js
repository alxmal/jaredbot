process.env["NTBA_FIX_319"] = 1;

import TelegramBot from "node-telegram-bot-api";
import config from "config";
import Koa from "koa";
import Router from "koa-router";

const TOKEN = config.get("token");
const PORT = config.get("port");
const bot = new TelegramBot(TOKEN);
bot.setWebHook(`${config.get("url")}/bot`);

const app = new Koa();
const router = Router();

router.post("/bot", ctx => {
	console.log(ctx);
	ctx.status = 200;
});

app.use(router.routes());

app.listen(PORT, () => {
	console.log(`Listening on ${PORT}`);
});
