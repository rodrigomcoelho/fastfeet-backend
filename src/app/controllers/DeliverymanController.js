import * as Yup from 'yup';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const deliverymen = await Deliveryman.findAll({
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        { model: File, as: 'avatar', attributes: ['name', 'path', 'url'] },
      ],
    });

    return res.json(deliverymen);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      avatar_id: Yup.number()
        .integer()
        .positive(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Invalid params' });

    const { name, email } = req.body;

    const existUser = await Deliveryman.findOne({ where: { email } });

    if (existUser)
      return res.status(401).json({ error: 'User already exists' });

    const deliveryman = await Deliveryman.create({ name, email });

    return res.json(deliveryman);
  }

  async show(req, res) {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: 'ID param invald' });

    const deliveryman = await Deliveryman.findByPk(id, {
      include: [
        { mode: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
      ],
    });

    return res.json(deliveryman);
  }

  async update(req, res) {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: 'ID param invald' });

    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Invalid params' });

    const { name, email } = req.body;

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman)
      return res.status(400).json({ error: 'Deliveryman not found' });

    const existDeliveryman = await Deliveryman.findOne({ where: { email } });

    if (existDeliveryman && existDeliveryman.email !== deliveryman.email)
      return res.status(400).json({ error: 'User already exist' });

    await deliveryman.update({ name, email });

    return res.json(deliveryman);
  }

  async delete(req, res) {
    const { id } = req.params;

    await Deliveryman.destroy({ where: { id } });

    return res.json();
  }
}

export default new DeliverymanController();
