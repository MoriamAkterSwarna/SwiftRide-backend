
import express from 'express';
import { PaymentController } from './payment.controller';
import { checkAuth } from '../../middlewares/checkAuth';
import { Role } from '../user/user.interface';
const router = express.Router();

router.post("/init-payment/:rideId", checkAuth(Role.USER), PaymentController.initPayment)
router.get('/success', PaymentController.successPayment )
router.post('/success', PaymentController.successPayment )
router.get('/fail', PaymentController.failPayment)
router.post('/fail', PaymentController.failPayment)
router.get('/cancel', PaymentController.cancelPayment)
router.post('/cancel', PaymentController.cancelPayment)
router.get('/invoice/:paymentId', checkAuth(...Object.values(Role)) ,PaymentController.getInvoiceDownloadUrl)
router.post('/validate-payment', PaymentController.validatePayment)
router.get('/history', checkAuth(...Object.values(Role)), PaymentController.getPaymentHistory)
router.get('/all', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), PaymentController.getAllPayments)

export  const PaymentRoutes = router;