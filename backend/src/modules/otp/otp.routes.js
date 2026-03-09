const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../../middlewares/validate.js");
const service = require("./otp.service");

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

/**
 * @swagger
 * /api/otp/request:
 *   post:
 *     summary: Request an OTP for a ticket
 *     tags: [OTP]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [referenceCode]
 *             properties:
 *               referenceCode: { type: string, example: ACM-2024-001 }
 *     responses:
 *       200: { description: OTP sent, returns masked email }
 *       404: { description: Ticket not found }
 */
router.post(
  "/request",
  [body("referenceCode").notEmpty()],
  validate,
  wrap(async (req, res) => {
    const result = await service.requestOtp(
      req.body.referenceCode.toUpperCase(),
    );
    res.json(result);
  }),
);

/**
 * @swagger
 * /api/otp/verify:
 *   post:
 *     summary: Verify OTP and get temporary access token
 *     tags: [OTP]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [referenceCode, code]
 *             properties:
 *               referenceCode: { type: string }
 *               code:          { type: string, example: '123456' }
 *     responses:
 *       200: { description: accessToken (30 min JWT) }
 *       400: { description: Invalid, expired, or too many attempts }
 */
router.post(
  "/verify",
  [body("referenceCode").notEmpty(), body("code").isLength({ min: 6, max: 6 })],
  validate,
  wrap(async (req, res) => {
    const result = await service.verifyOtp(
      req.body.referenceCode.toUpperCase(),
      req.body.code,
    );
    res.json(result);
  }),
);

module.exports = router;
