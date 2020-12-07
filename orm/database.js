const {Sequelize} = require("sequelize");
const { database_name, database_user, database_password, database_host } = require('../config.json')

module.exports = {
    manager: function() {
        const sequelize = new Sequelize(database_name, database_user, database_password, {
            host: database_host,
            dialect: 'mysql',
            logging: true,
        });
        return sequelize;
    },
    shipRequestModel: function() {
        const shipRequestsModel = this.manager().define('ShipRequests', {
            ship: {
                type: Sequelize.STRING,
                allowNull: false
            },
            amount: {
                type: Sequelize.INTEGER,
                defaultValue: 1,
                allowNull: false
            },
            blueprint: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false
            },
            pilot: {
                type: Sequelize.STRING,
                allowNull: false
            },
            pilot_id: {
                type:Sequelize.STRING,
                allowNull: false
            },
            payment: {
                type: Sequelize.STRING,
                allowNull: false
            },
            status: {
                type: Sequelize.STRING,
                defaultValue: "Pending"
            }
        });

        return shipRequestsModel;
    },
    addShipRequest: async function (srShip, srAmount, srBlueprint, srPilot, srPilot_id, srPayment) {
        try {
            const request = await this.shipRequestModel().create({
                ship: srShip,
                amount: srAmount,
                blueprint: srBlueprint,
                pilot: srPilot,
                pilot_id: srPilot_id,
                payment: srPayment
            });
        } catch (e) {
            return `Something went wrong with adding a ship request, try again!\n Error: ${e}`
        }

    },
    getShipRequests: function () {

    }
}

