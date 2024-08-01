import multer from "multer";

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"./public/temp")
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname)
    }
})  

export const uploadMultiple = multer({
    storage,
}).array('uploadedImages');

export const upload = multer({
    storage,
    limits: {
      fileSize: 1 * 1000 * 1000,
    },
});

export const uploadSingle = multer({
    storage,
}).array('files');