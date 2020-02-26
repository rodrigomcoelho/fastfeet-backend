import Mail from '../../lib/Mail';

class NewDeliveryMain {
  get key() {
    return 'NewDeliveryMain';
  }

  async handle({ data }) {
    const { delivery } = data;

    await Mail.sendMail({
      to: `${delivery.deliveryman.name} <${delivery.deliveryman.email}>`,
      subject: 'Você tem um novo pacote',
      template: 'newdelivery',
      context: {
        deliveryman: delivery.deliveryman.name,
        product: delivery.product,
      },
    });
  }
}

export default new NewDeliveryMain();
