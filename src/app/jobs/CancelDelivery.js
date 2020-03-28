import Mail from '../../lib/Mail';

class CancelDelivery {
  get key() {
    return 'CancelDelivery';
  }

  async handle({ data }) {
    const { cancelInfo } = data;

    await Mail.sendMail({
      to: `${cancelInfo.name} <${cancelInfo.email}>`,
      subject: 'Entrega cancelada',
      template: 'deliverycancellation',
      context: {
        deliveryman: cancelInfo.name,
        product: cancelInfo.product,
        problem: cancelInfo.problem,
        address: cancelInfo.address,
      },
    });
  }
}

export default new CancelDelivery();
