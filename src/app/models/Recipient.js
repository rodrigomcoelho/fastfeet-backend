import Sequelize, { Model } from 'sequelize';

class Recipient extends Model {
  static init(sequelize) {
    const comma = ', ';
    const hyphen = ' - ';
    super.init(
      {
        name: Sequelize.STRING,
        street: Sequelize.STRING,
        address1: Sequelize.STRING,
        number: Sequelize.INTEGER,
        state: Sequelize.STRING,
        city: Sequelize.STRING,
        zipcode: Sequelize.STRING,
        fullAddress: {
          type: Sequelize.VIRTUAL,
          get() {
            return `${this.street}${
              this.number ? `${comma}nº ${this.number}` : ''
            }${this.city ? comma + this.city : ''}${
              this.state ? hyphen + this.state : ''
            }`;
          },
        },
      },
      { sequelize }
    );

    return this;
  }
}

export default Recipient;
