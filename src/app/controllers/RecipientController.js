import * as Yup from 'yup';
import { Op } from 'sequelize';
import Recipient from '../models/Recipient';

class RecipientController {
  async index(req, res) {
    const { page = 1, limit = 20, q, all, order } = req.query;

    const where = q ? { name: { [Op.iLike]: `%${q}%` } } : {};

    const vLimit = all ? null : limit;
    const offset = all ? null : (page - 1) * limit;

    const sort = order ? order.split(' ') : ['id'];

    const recipients = await Recipient.findAll({
      where,
      limit: vLimit,
      offset,
      order: sort,
    });

    return res.json(recipients);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      address1: Yup.string(),
      number: Yup.number()
        .required()
        .positive()
        .integer(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zipcode: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Invalid params' });

    const { name, street, address1, number, state, city, zipcode } = req.body;

    const recipient = await Recipient.create({
      name,
      street,
      address1,
      number,
      state,
      city,
      zipcode,
    });

    return res.json(recipient);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      address1: Yup.string(),
      number: Yup.number()
        .required()
        .positive()
        .integer(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zipcode: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Invalid params' });

    const { id } = req.params;

    const recipient = await Recipient.findByPk(id);

    if (!recipient)
      return res.status(400).json({ error: 'Recipient not found' });

    await recipient.update(req.body);

    return res.json(recipient);
  }

  async show(req, res) {
    const { id } = req.params;

    const recipient = await Recipient.findByPk(id);

    if (!recipient)
      return res.status(400).json({ error: 'Recipient not found' });

    return res.json(recipient);
  }

  async delete(req, res) {
    const { id } = req.params;

    await Recipient.destroy({ where: { id } });

    return res.json();
  }
}

export default new RecipientController();
