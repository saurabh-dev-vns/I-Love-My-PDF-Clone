const express = require('express');
const router = express.Router();

const createUploader = require('../../config/multer.config');
const { ALLOWED_PDF_MIME } = require('../../config/constants');
const asyncHandler = require('../../middlewares/asyncHandler');
const controller = require('./protect.controller');

const upload = createUploader({ allowedMime: ALLOWED_PDF_MIME });

router.get('/', controller.showForm);
router.post('/', upload.single('file'), asyncHandler(controller.handleProtect));

module.exports = router;
