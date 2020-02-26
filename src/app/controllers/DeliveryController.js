import * as Yup from 'yup';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Queue from '../../lib/Queue';
import NewDeliveryMain from '../jobs/NewDeliveryMain';

class DeliveryController {
  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number()
        .required()
        .integer()
        .positive(),
      deliveryman_id: Yup.number()
        .required()
        .integer()
        .positive(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation fails' });

    const { product, recipient_id, deliveryman_id } = req.body;

    let delivery = await Delivery.create({
      product,
      recipient_id,
      deliveryman_id,
    });

    delivery = await Delivery.findByPk(delivery.id, {
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    Queue.add(NewDeliveryMain.key, { delivery });

    return res.json({ product, recipient_id, deliveryman_id });
  }
}

export default new DeliveryController();
