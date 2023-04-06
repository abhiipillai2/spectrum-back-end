const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const moment = require('moment')
const date = moment()
const pool = require('./databseAdapter')
const logger = require('./logMaster')
const dotenv = require('dotenv').config({ path: './class/sql.env' })
const router = express.Router()


//must use body parser for decoding the params from the url
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

router.post('/loadCurve', (req, res) => {

    //route paramters
    let param = req.body
    let hwId = param.hardware_id
    let strDate = param.start_date
    let endDate = param.end_date

    pool.connection.getConnection((err, connection) => {
        if (err) {

            logger.error(err)
        }

        connection.query("SELECT STR_TO_DATE(DATE_FORMAT(update_time, '%Y-%m-%d %H:00:00'), '%Y-%m-%d %H:%i:%s') + INTERVAL FLOOR(EXTRACT(MINUTE FROM update_time) / 15)*15 MINUTE as interval_start, AVG(apparant_power) as avg_value FROM vip_push_master_data WHERE update_time >= ? AND update_time < ? and hardware_id = ? GROUP BY STR_TO_DATE(DATE_FORMAT(update_time, '%Y-%m-%d %H:00:00'), '%Y-%m-%d %H:%i:%s'), FLOOR(EXTRACT(MINUTE FROM update_time) / 15) ORDER BY interval_start ASC LIMIT 0, 25;",[strDate,endDate,hwId],(err, rows) => {
            connection.release()

            if (!err) {
                res.send(rows)

                logger.info("sending data packet")
                logger.info(rows)

            } else {
                res.send(err)

                logger.error("database error")
                logger.error(err)
            }
        });

    });

});


router.get('/loadCurveMonth/:tred/:id', (req, res) => {

    //route paramters
    let param = req.params
    let maxnumber = req.params.id
    let node = req.params.tred

    logger.info("request reached")
    logger.info(param)
    logger.info("finding trde number")
    logger.info(maxnumber)
    logger.info("finding root id")
    logger.info(node)

    pool.connection.getConnection((err, connection) => {
        if (err) {

            logger.error(err)
        }

        logger.info(`connected id ${connection.threadId}`)
        console.log(`connected id ${connection.threadId}`)
        logger.info("finding data")
        logger.info(`SELECT * FROM puf_${node}  ORDER BY timestamp DESC LIMIT ${maxnumber}`)

        connection.query("SELECT DATE_FORMAT(CONCAT(DATE_FORMAT(update_time, '%Y-%m-%d %H'), ':', LPAD((MINUTE(update_time) DIV 15) * 15, 2, '0'), ':00'), '%Y-%m-%d %H:%i:%s') AS quarter_hour_start, AVG(apparant_power) AS avg_value FROM vip_push_master_data WHERE update_time >= DATE_SUB(NOW(), INTERVAL ? MINUTE) AND hardware_id = ? GROUP BY quarter_hour_start",[maxnumber,node],(err, rows) => {
            connection.release()

            if (!err) {
                res.send(rows)

                logger.info("sending data packet")
                logger.info(rows)

            } else {
                res.send(err)

                logger.error("database error")
                logger.error(err)
            }
        });

    });

});

router.get('/loadCurveDay/:tred/:id', (req, res) => {

    //route paramters
    let param = req.params
    let maxnumber = req.params.id
    let node = req.params.tred

    logger.info("request reached")
    logger.info(param)
    logger.info("finding trde number")
    logger.info(maxnumber)
    logger.info("finding root id")
    logger.info(node)

    pool.connection.getConnection((err, connection) => {
        if (err) {

            logger.error(err)
        }

        logger.info(`connected id ${connection.threadId}`)
        console.log(`connected id ${connection.threadId}`)
        logger.info("finding data")
        logger.info(`SELECT * FROM puf_${node}  ORDER BY timestamp DESC LIMIT ${maxnumber}`)

        connection.query("SELECT DATE_FORMAT(CONCAT(DATE_FORMAT(update_time, '%Y-%m-%d %H'), ':', LPAD((MINUTE(update_time) DIV 15) * 15, 2, '0'), ':00'), '%Y-%m-%d %H:%i:%s') AS quarter_hour_start, AVG(apparant_power) AS avg_value FROM vip_push_master_data WHERE update_time >= DATE_SUB(NOW(), INTERVAL ? MINUTE) AND hardware_id = ? GROUP BY quarter_hour_start",[maxnumber,node],(err, rows) => {
            connection.release()

            if (!err) {
                res.send(rows)

                logger.info("sending data packet")
                logger.info(rows)

            } else {
                res.send(err)

                logger.error("database error")
                logger.error(err)
            }
        });

    });

});


//exporting
module.exports = router;