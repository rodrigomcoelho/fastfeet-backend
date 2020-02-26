import * as Yup from 'yup';
import Delivery from '../models/Delivery';

class CompleteDeliveryController {
  async update(req, res) {
    const schema = Yup.object().shape({ end_date: Yup.date() });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Invalid params ' });

    const { end_date = new Date() } = req.body;

    const { id } = req.params;

    if (id) return res.status(400).json({ error: 'Delivery ID not provided' });

    const delivery = await Delivery.findOne({
      where: { id, canceled_at: null },
    });

    if (!delivery) return res.status(400).json({ error: 'Delivery not found' });

    if (req.userId !== delivery.deliveryman_id)
      return res
        .status(401)
        .json({ error: 'You can only update yours delivery' });

    delivery.end_date = end_date;

    await delivery.save();

    const { product, recipient_id, start_date } = delivery;

    return res.json({ id, product, recipient_id, start_date, end_date });
  }
}

export default new CompleteDeliveryController();
