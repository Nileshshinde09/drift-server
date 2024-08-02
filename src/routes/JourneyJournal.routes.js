import {
  createJJ,
  getJJChatAndPostDetails,
  deleteJJ,
  leaveGroupChat,
  addNewParticipantInAnoGroupChat,
  joinParticipantInAnoGroupChat,
  removeParticipantFromJJGroupChat,
  getAllJJChats,
  getAllUserPost,
  getUserJJFeed,
  updateJJ
} from "../controllers/journeyjournals.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { mongoIdPathVariableValidator } from "../validator/common/mongodb.validators.js"
import { validate } from "../validator/validate.js"
import { verifyIsOtpValidated } from "../middlewares/emailValidation.middlerware.js"
import { Router } from "express"
const router = Router();

router.use(verifyJWT, verifyIsOtpValidated);

router.route("/L/journey-journal")
  .get(getAllJJChats);

router.route("/L/journey-journal/post/:username")
  .get(getAllUserPost);

router.route("/U/journey-journal/post")
  .put(updateJJ);

router.route("/L/journey-journal/feed")
  .get(getUserJJFeed);

router
  .route("/c/journey-journal")
  .post(createJJ);

router
  .route("/journey-journal/:postId")
  .get(mongoIdPathVariableValidator("postId"), validate, getJJChatAndPostDetails)
  .delete(mongoIdPathVariableValidator("postId"), validate, deleteJJ);

router
  .route("/journey-journal/:chatId/:participantId")
  .post(
    mongoIdPathVariableValidator("chatId"),
    mongoIdPathVariableValidator("participantId"),
    validate,
    addNewParticipantInAnoGroupChat
  )
router
  .route("/journey-journal/join/:postId/:participantId")
  .post(
    mongoIdPathVariableValidator("postId"),
    mongoIdPathVariableValidator("participantId"),
    validate,
    joinParticipantInAnoGroupChat
  )
  .delete(
    mongoIdPathVariableValidator("chatId"),
    mongoIdPathVariableValidator("participantId"),
    validate,
    removeParticipantFromJJGroupChat
  );

router
  .route("/journey-journal/leave/group/:chatId")
  .delete(mongoIdPathVariableValidator("chatId"), validate, leaveGroupChat);

export default router;
