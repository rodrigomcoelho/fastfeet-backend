import * as Yup from 'yup';
import { Op } from 'sequelize';
import {
  parseISO,
  isBefore,
  isAfter,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  startOfDay,
  endOfDay,
} from 'date-fns';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';

class WithdrawDeliveryController {
  async index(req, res) {
    const { page = 1, limit = 20, finished } = req.query;
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: 'Deliveryman is invalid' });

    const deliveyman = await Deliveryman.findByPk(id);

    if (!deliveyman)
      return res.status(400).json({ error: 'Deliveryman not found' });

    const where = { canceled_at: null, deliveryman_id: id };

    where.end_date = finished && finished === 'true' ? { [Op.ne]: null } : null;

    const deliveries = await Delivery.findAll({
      where,
      attributes: [
        'id',
        'product',
        'createdAt',
        'start_date',
        'end_date',
        'status',
        'deliveryman_id',
      ],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'street',
            'number',
            'state',
            'city',
            'zipcode',
          ],
        },
      ],
      limit,
      offset: (page - 1) * limit,
      order: [
        finished && finished === 'true'
          ? ['end_date', 'DESC']
          : ['createdAt', 'ASC'],
      ],
    });

    return res.json(deliveries);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Invalid Params' });

    let { start_date } = req.body || new Date();

    start_date = parseISO(start_date);

    const minRange = setMilliseconds(
      setSeconds(setMinutes(setHours(start_date, 8), 0), 0),
      0
    );

    const maxRange = setMilliseconds(
      setSeconds(setMinutes(setHours(start_date, 18), 0), 0),
      0
    );

    if (isBefore(start_date, minRange) || isAfter(start_date, maxRange))
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

    const maxDeliveries = await Delivery.findAll({
      where: {
        start_date: {
          [Op.between]: [startOfDay(start_date), endOfDay(start_date)],
        },
      },
    });

    if (maxDeliveries.length >= 5)
      return res.status(401).json({
        error: 'You may only withdraw 5 deliveries per day',
      });

    const { product, recipient_id } = delivery;

    if (delivery.start_date)
      return res.status(401).json({
        error: 'You have already started the delivery',
        delivery: { id, product, start_date, recipient_id },
      });

    delivery.start_date = start_date;

    await delivery.save();

    return res.json({ id, product, start_date, recipient_id });
  }
}

export default new WithdrawDeliveryController();
