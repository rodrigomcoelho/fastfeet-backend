import * as Yup from 'yup';
import { Op } from 'sequelize';

import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import File from '../models/File';

import Queue from '../../lib/Queue';
import NewDeliveryMain from '../jobs/NewDeliveryMain';

class DeliveryController {
  async index(req, res) {
    const { page = 1, limit = 5, order } = req.query;
    const { q } = req.query;
    const where = q ? { product: { [Op.iLike]: `%${q}%` } } : {};
    const sort = order ? order.split(' ') : ['id'];
    const deliveries = await Delivery.findAll({
      where,
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name'],
          include: [
            { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
          ],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'street',
            'number',
            'city',
            'state',
            'zipcode',
          ],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'path', 'url'],
        },
      ],
      limit,
      offset: (page - 1) * limit,
      order: sort,
    });

    return res.json(deliveries);
  }

  async show(req, res) {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID param invald' });

    const delivery = await Delivery.findByPk(id, {
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'street',
            'number',
            'city',
            'state',
            'zipcode',
          ],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    if (!delivery) return res.status(400).json({ error: 'Delivery not found' });

    return res.json(delivery);
  }

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

    return res.json({ id: delivery.id, product, recipient_id, deliveryman_id });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string(),
      recipient_id: Yup.number()
        .integer()
        .positive(),
      deliveryman_id: Yup.number()
        .integer()
        .positive(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation fails' });

    const { id } = req.params;

    const delivery = await Delivery.findByPk(id);

    if (!delivery) return res.status(400).json({ error: 'Delivery not found' });

    const { product, recipient_id, deliveryman_id } = req.body;

    await delivery.update({ product, recipient_id, deliveryman_id });

    return res.json(delivery);
  }

  async delete(req, res) {
    const { id } = req.params;

    await Delivery.destroy({ where: { id } });

    return res.json();
  }
}

export default new DeliveryController();
