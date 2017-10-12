"use strict";

const Conversation = require("../models/conversation"),
  Message = require("../models/message"),
  User = require("../models/user");

// ==========================
// Get All Conversations By User with last message
// ==========================
module.exports.getConversations = function(req, res, next) {
  // Return only one message from each conversation to display as a snippet
  Conversation.find({ participants: req.user._id })
    .select("_id")
    .exec((err, converstions) => {
      if (err) {
        res.send({ error: err });
        return next(err);
      }

      if(converstions.length === 0) {
        return res.status(200).json({ message: "No conversations yet" });
      }

      // Set up empty array to hold conversations + most recent message
      let fullConversations = [];
      converstions.forEach(conversation => {
        Message.find({ conversationId: conversation._id })
          .sort("-createdAt")
          .limit(1)
          .populate({
            path: "author",
            select: "profile.firstName profile.lastName"
          })
          .exec((err, message) => {
            if (err) {
              res.send({ error: err });
              return next(err);
            }

            fullConversations.push(message);
            if (fullConversations.length === converstions.length) {
              return res.status(200).json({ converstions: fullConversations });
            }
          });
      });
    });
};

// ==========================
// GET CONVERSATION WITH MESSAGES
// ==========================
module.exports.getConversation = function(req, res, next) {
  Message.find({ conversationId: req.params.conversationId })
    .select("createdAt body author")
    .sort("-createdAt")
    .populate({
      path: "author",
      select: "profile.firstName profile.lastName"
    })
    .exec((err, messages) => {
      if (err) {
        res.send({ error: err });
        return next(err);
      }

      res.status(200).json({ conversation: messages });
    });
};

// ==========================
// CREATE NEW CONVERSATION
// ==========================
module.exports.newConversation = function(req, res, next) {
  if (!req.params.recipient) {
    res
      .status(422)
      .send({ error: "Please choose a valid recipient for your message" });
    return next();
  }

  if (!req.body.composedMessage) {
    res.status(422).send({ error: "Please, enter a message" });
    return next();
  }

  const conversation = new Conversation({
    participants: [req.user._id, req.params.recipient]
  });

  converstion.save((err, newConversation) => {
    if (err) {
      res.send({ error: err });
      return next(err);
    }

    const message = new Message({
      conversationId: newConversation._id,
      body: req.body.composedMessage,
      author: req.user._id
    });

    message.save((err, newMessage) => {
      if (err) {
        res.send({ error: err });
        return next(err);
      }

      res.status(200).json({
        message: "Conversation started",
        conversationId: conversation._id
      });
    });
  });
};

// ==========================
// Add a reply to a Message within an existing conversation
// ==========================
module.exports.sendReply = function(req, res, next) {
  if (!req.body.composedMessage) {
    res.status(422).send({ error: "Please, enter a message" });
    return next();
  }

  const reply = new Message({
    conversationId: req.params.conversationId,
    author: req.user._id,
    body: req.body.composedMessage
  });

  reply.save((err, sendReply) => {
    if (err) {
      res.send({ error: err });
      return next(err);
    }

    res.status(200).json({ message: "Reply was succesfully sent!" });
    return next();
  });
};

// ==========================
// DELETE A CONVERSATION
// ==========================
module.exports.deleteConversation = function(req, res, next) {
  Conversation.findOneAndRemove(
    {
      $and: [{ _id: req.params.conversationId }, { participants: req.user._id }]
    },
    err => {
      if (err) {
        res.send({ error: err });
        return next(err);
      }

      res.status(200).json({ message: "Conversation was removed" });
      return next();
    }
  );
};

// ==========================
// UPDATE A MESSAGE
// ==========================
module.exports.updateMessage = function(req, res, next) {
  Conversation.find(
    {
      $and: [{ _id: req.params.messageId }, { author: req.user._id }]
    },
    (err, message) => {
      if (err) {
        res.send({ error: err });
        return next(err);
      }

      message.body = req.body.composedMessage;
      message.save((err, updatedMessage) => {
        if (err) {
          res.send({ error: err });
          return next(err);
        }

        res.status(200).json({ message: "Message was updated" });
        return next();
      });
    }
  );
};
