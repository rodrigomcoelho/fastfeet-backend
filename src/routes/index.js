import { Router } from 'express';

import SessionController from '../app/controllers/SessionController';
import RecipientController from '../app/controllers/RecipientController';
import DeliverymanController from '../app/controllers/DeliverymanController';
import DeliveryController from '../app/controllers/DeliveryController';
import WithdrawDeliveryController from '../app/controllers/WithdrawDeliveryController';

import authMiddleware from '../app/middlewares/auth';

const router = new Router();

router.post('/session', SessionController.store);

router.use(authMiddleware);

router.get('/recipients', RecipientController.index);
router.post('/recipients', RecipientController.store);
router.put('/recipients/:id', RecipientController.update);

router.get('/deliverymen', DeliverymanController.index);
router.post('/deliverymen', DeliverymanController.store);
router.get('/deliverymen/:id', DeliverymanController.show);
router.put('/deliverymen/:id', DeliverymanController.update);
router.delete('/deliverymen/:id', DeliverymanController.delete);

router.put('/deliverymen/:id/withdraw', WithdrawDeliveryController.update);

router.post('/deliveries', DeliveryController.store);

export default router;
