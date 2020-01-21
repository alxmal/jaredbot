const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatUserSchema = new Schema({
	id: Number,
	date: Date,
	text: String
});

const ChatUser = mongoose.model("ChatUser", ChatUserSchema);

module.exports = ChatUser;
