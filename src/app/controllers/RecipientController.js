import * as Yup from 'yup';
import Recipient from '../models/Recipient';

class RecipientController {
  async index(req, res) {
    const recipients = await Recipient.findAll();

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
      zipcode: Yup.number()
        .positive()
        .integer(),
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
      zipcode: Yup.number()
        .positive()
        .integer(),
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
}

export default new RecipientController();
