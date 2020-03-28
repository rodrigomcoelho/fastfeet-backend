import * as Yup from 'yup';
import Problem from '../models/Problem';
import Delivery from '../models/Delivery';

class ProblemDeliveryController {
  async index(req, res) {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!id) return res.status(400).json({ error: 'Delivery ID invalid ' });

    const problems = await Problem.findAll({
      where: { delivery_id: id },
      include: [{ model: Delivery, as: 'delivery' }],
      limit,
      offset: (page - 1) * limit,
    });

    return res.json(problems);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Invalid params' });

    const { id } = req.params;

    if (!id) return res.status(400).json({ error: 'Delivery ID invalid' });

    const delivery = await Delivery.findOne({
      where: { id, canceled_at: null, end_date: null },
    });

    if (!delivery) return res.status(400).json({ error: 'Delivery not found' });

    const { description } = req.body;

    const problem = await Problem.create({ delivery_id: id, description });

    return res.json({ id: problem.id, description, delivery });
  }
}

export default new ProblemDeliveryController();
