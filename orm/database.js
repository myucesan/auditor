const sequelize = require("sequelize");
const {Sequelize} = require("sequelize");
const { database_name, database_user, database_password, database_host } = require('../config.json')

module.exports = {
    manager: function() {
        const sequelize = new Sequelize(database_name, database_user, database_password, {
            host: database_host,
            dialect: 'mysql',
            // logging: true,
        });
        return sequelize;
    },
    shipRequestModel: function() {
        let shipRequestsModel = this.manager().define('ShipRequests', {
            ship: {
                type: Sequelize.STRING,
                allowNull: false
            },
            blueprint: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false
            },
            price: {
                type: Sequelize.FLOAT,
                allowNull : true
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
            },
            notes: {
                type: Sequelize.STRING,
                allowNull: true
            }
        });

        return shipRequestsModel;
    },
    addShipRequest: async function (srShip, srBlueprint, srPilot, srPilot_id, srPayment) {
        console.log(123)
        try {
            const request = await this.shipRequestModel().create({
                ship: srShip,
                blueprint: srBlueprint,
                pilot: srPilot,
                pilot_id: srPilot_id,
                payment: srPayment
            });
        } catch (e) {
            return `Something went wrong with adding a ship request, try again!\n Error: ${e}`
        }

    },
    getOngoingShipRequests: async function () {
        try {
            return await this.shipRequestModel().findAll({where: {status:{[sequelize.Op.not]: "completed"} }});
        } catch(e) {
            console.log("Error is:" +e);
        }
    }, getShipRequests: async function (status = "completed") {
        try {
            return await this.shipRequestModel().findAll({where: {status: "completed"}});
        } catch(e) {
            console.log("Error is:" +e);
        }
    },
    updateShipRequest: async function(id, what="status", value) {
        if (what === "status") {
            try {
                const affectedRows = await this.shipRequestModel().update({status: value}, { where: {id: id}})
            } catch(e) {
                console.log("Error is:" + e);
            }
        } else if (what === "notes") {
            try {
                const affectedRows = await this.shipRequestModel().update({notes: value}, { where: {id: id}})
            } catch(e) {
                console.log("Error is:" + e);
            }
        }

     }
}

