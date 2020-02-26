import * as Yup from 'yup';
import { parseISO, isBefore, isAfter, setHours } from 'date-fns';
import Delivery from '../models/Delivery';

class WithdrawDeliveryController {
  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Invalid Params' });

    let { start_date } = req.body || new Date();

    start_date = parseISO(start_date);

    if (
      isBefore(start_date, setHours(start_date, 8)) ||
      isAfter(start_date, setHours(start_date, 18))
    )
      return res.status(400).json({
        error: 'Withdraw is only allowed between 8h and 18h',
        start_date,
      });

    const { id } = req.params;

    if (!id) return res.status(400).json({ error: 'Delivery ID invalid' });

    const delivery = await Delivery.findOne({
      where: { id, canceled_at: null },
    });

    if (!delivery) return res.status(400).json({ error: 'Delivery not found' });

    const { product, recipient_id } = delivery;

    if (delivery.start_date)
      return res.status(401).json({
        error: 'You have already started the delivery',
        delivery: { id, product, start_date, recipient_id },
      });

    const sameDeliveryman = req.userId === delivery.deliveryman_id;

    if (!sameDeliveryman)
      return res
        .status(401)
        .json({ error: 'This delivery is assigned to another deliveryman' });

    delivery.start_date = start_date;

    await delivery.save();

    return res.json({ id, product, start_date, recipient_id });
  }
}

export default new WithdrawDeliveryController();
