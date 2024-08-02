import { Router } from "express";
import {
  addNewParticipantInGroupChat,
  createAGroupChat,
  deleteGroupChat,
  getAllChats,
  getGroupChatDetails,
  leaveGroupChat,
  removeParticipantFromGroupChat,
  renameGroupChat,
  searchAvailableFriends,
} from "../controllers/Chat/chat.controller.js"
import {
  createOrGetAOneOnOneChat,
  deleteOneOnOneChat
} from "../controllers/Chat/oneOnoneChat.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { mongoIdPathVariableValidator } from "../validator/common/mongodb.validators.js"
import { validate } from "../validator/validate.js"
import { createAGroupChatValidator, updateGroupChatNameValidator } from "../validator/chat.validators.js"
import { verifyIsOtpValidated } from "../middlewares/emailValidation.middlerware.js"
import { StopTypingEvent, TypingEvent } from "../controllers/Chat/events.controller.js";

const router = Router();

router.use(verifyJWT, verifyIsOtpValidated);

router.route("/")
  .get(getAllChats);

router.route("/friends")
  .get(searchAvailableFriends);

router
  .route("/c/:receiverId")
  .post(
    mongoIdPathVariableValidator("receiverId"),
    validate,
    createOrGetAOneOnOneChat
  );

router
  .route("/group")
  .post( createAGroupChat);
  // createAGroupChatValidator(), validate,
router
  .route("/group/:chatId")
  .get(mongoIdPathVariableValidator("chatId"), validate, getGroupChatDetails)
  .patch(
    // mongoIdPathVariableValidator("chatId"),
    // updateGroupChatNameValidator(),
    // validate,
    renameGroupChat
  )
  .delete(mongoIdPathVariableValidator("chatId"), validate, deleteGroupChat);

router
  .route("/group/:chatId/:participantId")
  .post(
    mongoIdPathVariableValidator("chatId"),
    mongoIdPathVariableValidator("participantId"),
    validate,
    addNewParticipantInGroupChat
  )
  .delete(
    mongoIdPathVariableValidator("chatId"),
    mongoIdPathVariableValidator("participantId"),
    validate,
    removeParticipantFromGroupChat
  );

router
  .route("/leave/group/:chatId")
  .delete(mongoIdPathVariableValidator("chatId"), validate, leaveGroupChat);

router
  .route("/remove/:chatId")
  .delete(mongoIdPathVariableValidator("chatId"), validate, deleteOneOnOneChat);

router
  .route("/typing-event/:chatId")
  .post(
    TypingEvent
  )
  .delete(
    StopTypingEvent
  )

export default router;
