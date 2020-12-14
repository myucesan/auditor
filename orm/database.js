const sequelize = require("sequelize");
const {Sequelize} = require("sequelize");
const { database_name, database_user, database_password, database_host } = require('../config.json')
const dfns = require("date-fns")
const eoLocale = require('date-fns/locale/eo')

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
    }, getTodaysShipRequests: async function () {
        // TODO: fix dates
        let day = new Date();
        let startDay = dfns.setHours(day, 1);
        startDay = dfns.setMinutes(startDay, 0);
        startDay = dfns.setMilliseconds(startDay, 0);
        let endDay = dfns.setHours(day, 0);
        endDay = dfns.setMinutes(endDay, 59);
        endDay = dfns.setMilliseconds(endDay, 999);

        startDay = dfns.format(startDay, 'yyyy-MM-dd hh:mm:ss', );
        endDay = dfns.format(endDay, 'yyyy-MM-dd hh:mm:ss');


        console.log(startDay);
        console.log(endDay);
        try {
            return await this.shipRequestModel().findAll({where: {createdAt: {
                [sequelize.Op.gt]: '2020-12-13 00:00:00',
                [sequelize.Op.lt]: '2020-12-13 22:59:59'}}});
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

     }, getUserByShipRequestID: async function(by = "srid",id) {
        if (by === "by_pilot") {
            try {
                return await this.shipRequestModel().findAll({where: {pilot_id: id, [sequelize.Op.not]: {status : "Completed"}}});
            } catch(e) {
                console.log("Error is:" + e);
            }
        }
        else if (by === "srid") {
            try {
                return await this.shipRequestModel().findAll({where: {id: id}});
            } catch(e) {
                console.log("Error is:" + e);
            }
        }

    }
}

