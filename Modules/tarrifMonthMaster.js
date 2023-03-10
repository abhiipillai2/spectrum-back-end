const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const moment = require('moment')
const date = moment()
const pool = require('./databseAdapter')
const logger = require('./logMaster')
const dotenv = require('dotenv').config({ path: './class/sql.env' })
const router = express.Router()



//////////////////////////////
//bill hour
router.post('/monthBill/:tred/:id', (req, res) => {

    console.log(req)
    //route paramters
    let param = req.params
    let maxnumber = req.params.id
    let node = req.params.tred
    let provder_name =req.body.provider_id
    let provider_id = 0
    let avgUnit =0
    let slab = 0
    let slab_value =0
    let bill = 0
    let bill_split = 0
    let bill_total = 0
    let UNIT = 0
    let dayHour = 0

    console.log("provider name")
    console.log(req.body)
    pool.connection.getConnection( (err, connection) => {
        if (err) {

            logger.error(err)
        }

        dayHour = (maxnumber * 24)

        let monthHour = (maxnumber * 672)
        //finding avg power
        connection.query('SELECT apparant_power FROM vip_push_master_data WHERE update_time >= NOW() - INTERVAL ? HOUR and hardware_id = ?',[monthHour,node],(err,rows)=>{

            if (!err) {
                let grb = JSON.parse(JSON.stringify(rows))
                let snapshot_value = 0
                let snapshot = 0
                //finding avg unit
                for (let i = 0; i < grb.length; i++) {

                    snapshot_value = grb[i].apparant_power + snapshot_value
                }
                snapshot = snapshot_value / grb.length
                avgUnit = ((snapshot * monthHour )/1000)
                //houer case
                if (avgUnit <= 50){

                //tesliscopic case
                bill_total = (avgUnit * 3.15)
                let snapJSON = { value: bill_total }
                res.send(snapJSON)

                }else if(avgUnit >= 300){

                //teliscopic
                //finding slab 
                connection.query('SELECT provider_id FROM tarrif_provider_mapping WHERE provider_name = ?',provder_name,(err,rows)=>{
                    if(!err){

                        //provider id
                        provider_id = rows[0].provider_id
                        
                        //finding slab
                        connection.query('select slab from teliscopic_tarrif_description where slab_limit <= ? AND provider_id = ? ORDER BY id DESC LIMIT 1',[avgUnit,provider_id],(err,rows)=>{
                            if(!err){

                                //slab
                                slab = rows[0].slab

                                //slab value
                                connection.query('select slab_value from teliscopic_tarrif_value_mapping where provider_id = ? AND slab = ? ORDER BY id DESC LIMIT 1',[ provider_id , slab ],(err,rows)=>{
                                    if(!err){

                                        //slab value
                                        slab_value = rows[0].slab_value

                                        //bill total
                                        bill_total = (slab_value * avgUnit)

                                        let snapJSON = { value: bill_total }
                                        res.send(snapJSON)

                                    }else{
                                        res.send(err)
                                    }
                                })

                            }else{
                                res.send(err)
                            }
                        })
                    }else{
                        res.send(err)
                    }
                })

                }else{

                    //finding clint id
                    connection.query('SELECT provider_id FROM tarrif_provider_mapping WHERE provider_name = ?',provder_name,(err,rows) => {
                        if(!err){

                                //provider id
                                provider_id = rows[0].provider_id
                                // let snapJSON = { value: provider_id }
                                // res.send(snapJSON)

                                //spliting avg unit
                                for (let i = 50; i<=avgUnit ;i = i + 50 ){

                                    //finding slab
                                    connection.query('select slab from tarrif_discription where end_value <= ? AND provider_id = ? ORDER BY id DESC LIMIT 1',[i,provider_id],(err,rows) =>{
                                        if(!err){

                                            //finding slab value
                                            slab = rows[0].slab
                                            connection.query('select slab_value from tarrif_value_mapping where provider_id = ? AND slab = ? ORDER BY id DESC LIMIT 1',[ provider_id , slab ],(err,rows)=>{
                                                if(!err){

                                                    //slab value
                                                    slab_value = rows[0].slab_value
                                                    bill = (slab_value * i )
                                                    
                                                    //total bill
                                                    bill_total = (bill_total + bill)
                                                    // console.log(bill_total)
                                                    // console.log(avgUnit)
                                                    console.log(i)
                                                    if(i > (avgUnit - 50) ){

                                                        if(i == avgUnit ){
                                                            let snapJSON = { value: bill_total }
                                                            res.send(snapJSON)
                                                        }else{

                                                            let excessPower = (i + 50)
                                                            let leastValue = (avgUnit -excessPower)
                                                            balancePower = (excessPower + leastValue)
                                                            //finding slab of balnce power
                                                            connection.query('select slab from tarrif_discription where end_value <= ? AND provider_id = ? ORDER BY id DESC LIMIT 1',[balancePower,provider_id],(err,rows) =>{
                                                                if(!err){
                                                                    let new_slab = rows[0].slab

                                                                    //finding new slab value
                                                                    connection.query('select slab_value from tarrif_value_mapping where provider_id = ? AND slab = ? ORDER BY id DESC LIMIT 1',[ provider_id , new_slab ],(err,rows)=>{
                                                                        if(!err){
                                                                            let new_slab_value = rows[0].slab_value
                                                                            let additional_bill = (new_slab_value * balancePower)

                                                                            let value_bill =(additional_bill + bill_total)

                                                                            //sending hedders
                                                                            let snapJSON = { value: value_bill }
                                                                            res.send(snapJSON)
                                                                        }else{
                                                                            res.send(err)
                                                                        }
                                                                    })
                                                                }else{
                                                                    res.send(err)
                                                                }
                                                            })
                                                        }
                                                        
                                                    }
                                                }else{
                                                    res.send(err)
                                                }
                                            })

                                        }else{
                                            res.send(err)
                                        }

                                    })
                                }

                        }else{
                            res.send(err)
                        }

                    })
                }
                
            } else {
                res.send(err)
            }

        })
    });
});

//exporting
module.exports = router;