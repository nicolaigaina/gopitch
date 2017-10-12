const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const MessageScgema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true // Saves createdAt and updatedAt as dates. CreatedAt will be our timestamp
  }
);

module.exports = mongoose.model("Message", MessageScgema);
