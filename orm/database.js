const sequelize = require("sequelize");
const {Sequelize} = require("sequelize");
const { database_name, database_user, database_password, database_host } = require('../config.json')
const { zonedTimeToUtc, utcToZonedTime, format, setHours} = require('date-fns-tz')

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
            market_price: {
                type: Sequelize.FLOAT,
                allowNull : false
            },
            blueprint_hull_corporation_price: {
                type: Sequelize.FLOAT,
                allowNull: false
            },
            corporation_hull_only_price: {
                type: Sequelize.FLOAT,
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
            },
            notes: {
                type: Sequelize.STRING,
                defaultValue:"none",
                allowNull: true
            }
        });

        return shipRequestsModel;
    },
    addShipRequest: async function (srShip, srBlueprint, market_price = 0, blueprint_hull_corporation_price = 0, corporation_hull_only_price = 0, srPilot, srPilot_id, srPayment) {
        try {
            const request = await this.shipRequestModel().create({
                ship: srShip,
                blueprint: srBlueprint,
                market_price: market_price,
                blueprint_hull_corporation_price: blueprint_hull_corporation_price,
                corporation_hull_only_price: corporation_hull_only_price,
                pilot: srPilot,
                pilot_id: srPilot_id,
                payment: srPayment
            });
        } catch (e) {
            console.log("fail")
            console.log(`Something went wrong with adding a ship request, try again!\n Error: ${e}`)
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
        // Obtain a Date instance that will render the equivalent Berlin time for the UTC date
        let date = new Date()
        let timeZone = 'Europe/Berlin'
        let zonedDate =  utcToZonedTime(date, timeZone)
// zonedDate could be used to initialize a date picker or display the formatted local date/time

// Set the output to "1.9.2018 18:01:36.386 GMT+02:00 (CEST)"
        const pattern = 'yyyy-MM-dd HH:mm:ss'
        const endDate = format(zonedDate, pattern, { timeZone: 'Europe/Berlin' })


        date = new Date()
        date.setHours(-1,0,0);
        timeZone = 'Europe/Berlin'
        zonedDate = utcToZonedTime(date, timeZone)
        const beginDate = format(zonedDate, pattern, { timeZone: 'Europe/Berlin' })

        try {
            return await this.shipRequestModel().findAll({where: {createdAt: {
                [sequelize.Op.gt]: beginDate,
                [sequelize.Op.lt]: endDate}}});
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

     }, getUserByShipRequestID: async function(by = "srid", id) {
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

