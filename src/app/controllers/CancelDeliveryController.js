import Problem from '../models/Problem';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';

import Queue from '../../lib/Queue';
import CancelDelivery from '../jobs/CancelDelivery';

class CancelDeliveryController {
  async update(req, res) {
    const { id } = req.params;

    const problem = await Problem.findByPk(id);

    if (!problem) return res.status(400).json({ error: 'Problem not found' });

    const delivery = await Delivery.findOne({
      where: { id: problem.delivery_id, canceled_at: null, end_date: null },
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['id', 'street', 'number'],
        },
      ],
    });

    if (!delivery) return res.status(400).json({ error: 'Delivery not found' });

    delivery.canceled_at = new Date();

    await delivery.save();

    const cancelInfo = {
      name: delivery.deliveryman.name,
      email: delivery.deliveryman.email,
      product: delivery.product,
      problem: problem.description,
      address: `${delivery.recipient.street}, nº ${delivery.recipient.number}`,
    };

    Queue.add(CancelDelivery.key, { cancelInfo });

    return res.json(cancelInfo);
  }
}

export default new CancelDeliveryController();
