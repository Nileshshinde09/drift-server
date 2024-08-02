import { Router } from "express";
import {
  deleteMessage,
  getAllMessages,
  sendMessage,
} from "../controllers/Chat/message.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js"
import { sendMessageValidator } from "../validator/message.validators.js";
import { mongoIdPathVariableValidator } from "../validator/common/mongodb.validators.js";
import { validate } from "../validator/validate.js"
import { verifyIsOtpValidated } from "../middlewares/emailValidation.middlerware.js"

const router = Router();

router.use(verifyJWT,verifyIsOtpValidated);

router
  .route("/:chatId")
  .get(mongoIdPathVariableValidator("chatId"),
    validate,
    getAllMessages
  )
  .post(
    upload.fields([{ name: "attachments", maxCount: 5 }]),
    mongoIdPathVariableValidator("chatId"),
    sendMessageValidator(),
    validate,
    sendMessage
  );

router
  .route("/:chatId/:messageId")
  .delete(
    mongoIdPathVariableValidator("chatId"),
    mongoIdPathVariableValidator("messageId"),
    validate,
    deleteMessage
  );

export default router;
