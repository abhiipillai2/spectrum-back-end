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

router.get('/peakValue/:tred', (req, res) => {

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

        connection.query("SELECT DATE_FORMAT(update_time, '%Y-%m-%d %H:%i:00') AS interval_start, MAX(apparant_power) AS max_data FROM vip_push_master_data WHERE update_time >= CURDATE() AND update_time < CURDATE() + INTERVAL 1 DAY AND hardware_id = ? GROUP BY FLOOR(MINUTE(update_time) / 30), DATE_FORMAT(update_time, '%Y-%m-%d %H') ",[node],(err, rows) => {
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