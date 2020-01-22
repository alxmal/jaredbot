const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatUserSchema = new Schema({
	userId: Number,
	userName: String,
	firstName: String,
	lastName: String
});

const ChatUser = mongoose.model("ChatUser", ChatUserSchema);

module.exports = ChatUser;
