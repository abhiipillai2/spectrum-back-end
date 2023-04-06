const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const userAdapter = require('./Modules/authAdapter')
const credentialAdaper = require('./Modules/credentialAdapter')
const hardwarePuash = require('./Modules/hardwarePush')
const hardwareAdapter = require('./Modules/hardwareAdapter')
const dataProcessor = require('./Modules/dataProcessor')
const logger = require('./Modules/logMaster')
const tarrifMaster = require('./Modules/tarrifMaster.js')
const tarrifDayMaster = require('./Modules/taffifdaymaster.js')
const tarrifMonthMaster = require('./Modules/tarrifMonthMaster.js')
const loadCurve = require('./Modules/loadCurveMater.js')
const peakValue = require('./Modules/peakValueMater.js')
const dotenv = require('dotenv').config({ path: './class/sql.env' })
const app = express()
const port = process.env.PORT || 5000 //must for production environmentnpm install dotenv --save

//must use body parser for decoding the params from the url
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())

//BL Adapters
//using AuthAdapter
app.use(userAdapter);

//using credential adapter
app.use(credentialAdaper);

//using vip push
app.use(hardwarePuash);

//using hardware adapter
app.use(hardwareAdapter);

//using dataprossor
app.use(dataProcessor);

//using taffif master
app.use(tarrifMaster);

//using taffif day master
app.use(tarrifDayMaster);

//using taffif month master
app.use(tarrifMonthMaster);

//using load curve
app.use(loadCurve);

//using peak value
app.use(peakValue);

app.listen(port, () => logger.info("Started sucessfully"));
