const express = require('express');
const router = express.Router();

const createUploader = require('../../config/multer.config');
const { ALLOWED_IMAGE_MIME } = require('../../config/constants');
const asyncHandler = require('../../middlewares/asyncHandler');
const controller = require('./imageToPdf.controller');

const upload = createUploader({ allowedMime: ALLOWED_IMAGE_MIME });

router.get('/', controller.showForm);
router.post('/', upload.array('files', 30), asyncHandler(controller.handleConvert));

module.exports = router;
