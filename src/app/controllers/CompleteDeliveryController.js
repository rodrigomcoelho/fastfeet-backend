import * as Yup from 'yup';
import Delivery from '../models/Delivery';
import File from '../models/File';

class CompleteDeliveryController {
  async update(req, res) {
    const schema = Yup.object().shape({
      end_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Invalid params ' });

    const { end_date = new Date() } = req.body;

    const { id } = req.params;

    if (!id) return res.status(400).json({ error: 'Delivery ID not provided' });

    const delivery = await Delivery.findOne({
      where: { id, canceled_at: null, end_date: null },
    });

    if (!delivery) return res.status(400).json({ error: 'Delivery not found' });

    if (!req.file)
      return res.status(401).json({ error: 'A signature is required' });

    const { filename: path, originalname: name } = req.file;

    if (!path || !name)
      return res.status(401).json({ error: 'Image mal formatted' });

    const file = await File.create({
      name,
      path,
    });

    delivery.end_date = end_date;
    delivery.signature_id = file.id;

    await delivery.save();

    const { product, recipient_id, start_date } = delivery;

    return res.json({ id, product, recipient_id, start_date, end_date, file });
  }
}

export default new CompleteDeliveryController();
