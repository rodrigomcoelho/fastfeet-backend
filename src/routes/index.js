import { Router } from 'express';
import multer from 'multer';

import multerConfig from '../config/multer';

import SessionController from '../app/controllers/SessionController';
import RecipientController from '../app/controllers/RecipientController';
import DeliverymanController from '../app/controllers/DeliverymanController';
import DeliveryController from '../app/controllers/DeliveryController';
import WithdrawDeliveryController from '../app/controllers/WithdrawDeliveryController';
import CompleteDeliveryController from '../app/controllers/CompleteDeliveryController';
import ProblemDeliveryController from '../app/controllers/ProblemDeliveryController';
import FileController from '../app/controllers/FileController';
import CancelDeliveryController from '../app/controllers/CancelDeliveryController';
import ProblemController from '../app/controllers/ProblemController';

import authMiddleware from '../app/middlewares/auth';

const router = new Router();

const updateFile = multer(multerConfig);

router.post('/session', SessionController.store);
router.get('/deliverymen/:id', DeliverymanController.show);
router.get('/deliverymen/:id/deliveries', WithdrawDeliveryController.index);
router.get('/deliveries/:id', DeliveryController.show);

router.put('/deliveries/:id/withdraw', WithdrawDeliveryController.update);

router.put(
  '/deliveries/:id/complete',
  updateFile.single('file'),
  CompleteDeliveryController.update
);

router.get('/deliveries/:id/problems', ProblemDeliveryController.index);
router.post('/deliveries/:id/problems', ProblemDeliveryController.store);

router.use(authMiddleware);

router.get('/recipients', RecipientController.index);
router.get('/recipients/:id', RecipientController.show);
router.post('/recipients', RecipientController.store);
router.put('/recipients/:id', RecipientController.update);
router.delete('/recipients/:id', RecipientController.delete);

router.get('/deliverymen', DeliverymanController.index);
router.post('/deliverymen', DeliverymanController.store);
router.put('/deliverymen/:id', DeliverymanController.update);
router.delete('/deliverymen/:id', DeliverymanController.delete);

router.post('/files', updateFile.single('file'), FileController.store);

router.post('/deliveries', DeliveryController.store);
router.put('/deliveries/:id', DeliveryController.update);
router.delete('/deliveries/:id', DeliveryController.delete);
router.get('/deliveries', DeliveryController.index);

router.get('/problems', ProblemController.index);
router.delete('/problems/:id/cancel-delivery', CancelDeliveryController.update);

export default router;
