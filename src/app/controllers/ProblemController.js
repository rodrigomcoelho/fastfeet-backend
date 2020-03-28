import Problem from '../models/Problem';
import Delivery from '../models/Delivery';

class ProblemController {
  async index(req, res) {
    const { page = 1, limit = 20 } = req.query;

    const problems = await Problem.findAll({
      include: [{ model: Delivery, as: 'delivery' }],
      limit,
      offset: (page - 1) * limit,
    });
    return res.json(problems);
  }
}

export default new ProblemController();
