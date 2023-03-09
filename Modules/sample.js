
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

    console.log(provder_name)

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

        console.log(`connected id ${connection.threadId}`)
        logger.info(`connected id ${connection.threadId}`)
        logger.info("finding data")
        logger.info(`SELECT * FROM puf_${node}  ORDER BY timestamp DESC LIMIT ${maxnumber}`)

        //find provider id from provider mapping 
        connection.query('SELECT provider_id FROM tarrif_provider_mapping WHERE provider_name = ?',provder_name, (err, rows) => {
            //connection.release()

            if (!err) {

                let grb = JSON.parse(JSON.stringify(rows))
                let snapshot_value = 0
                let snapshot = 0
                for (let i = 0; i < grb.length; i++) {

                    snapshot_value = grb[i].provider_id
                }

                provider_id = snapshot_value
                console.log(` provider_id ${provider_id}`)


            } else {
                res.send(err)

                logger.error("database eoor")
                logger.error(err)
            }
        });

        const my_fuction = async()=>{
            try {
                const [rows] = await connection.query('SELECT apparant_power FROM vip_push_master_data WHERE update_time >= NOW() - INTERVAL ? HOUR and hardware_id = ?',[maxnumber,node])
                
                return rows
            } catch (error) {
                
                res.send(error)
            }
        }
        //finding bill fare from vip table
        
            //connection.release()

            if (!err) {
                
                rows =  my_fuction()
                let grb = JSON.parse(JSON.stringify(rows))
                let snapshot_value = 0
                let snapshot = 0
                for (let i = 0; i < grb.length; i++) {

                    snapshot_value = grb[i].apparant_power + snapshot_value
                }
                snapshot = snapshot_value / grb.length
                avgUnit = (snapshot/1000)
                console.log(` avg_unit ${avgUnit}`)

                logger.info("sending data packet")
                logger.info(rows)
            } else {
                res.send(err)

                logger.error("database eoor")
                logger.error(err)
            }
            //SPLITING UNITS
            for (let i = 50 ; i <= avgUnit ; i = i + 50){

                UNIT = i
                //finding slab 
                connection.query('select slab from tarrif_discription where end_value <= ? AND provider_id = ? ORDER BY id DESC LIMIT 1',[UNIT,provider_id], (err, rows) => {
                    //connection.release()

                    if (!err) {

                        let grb = JSON.parse(JSON.stringify(rows))
                        let snapshot_value = 0
                        let snapshot = 0
                        for (let i = 0; i < grb.length; i++) {

                            snapshot_value = grb[i].slab
                        }

                        slab = snapshot_value
                        console.log(`slab ${slab}`)

                    } else {
                        res.send(err)

                        logger.error("database eoor")
                        logger.error(err)
                    }
                });

                let bill_Temp =  ( UNIT * slab_value )

                bill = ( bill_Temp + bill )
                console.log(`Bill ${bill}`)
                
            }

            if((UNIT - avgUnit) != 0 ){
                console.log("enter split section")
                UNIT = (UNIT + 50)
                console.log(`UNIT ${UNIT}`)
                connection.query('select slab from tarrif_discription where end_value <= ? AND provider_id = ? ORDER BY id DESC LIMIT 1',[UNIT,provider_id], (err, rows) => {
                //connection.release()

                    if (!err) {

                        let grb = JSON.parse(JSON.stringify(rows))
                        let snapshot_value = 0
                        let snapshot = 0
                        for (let i = 0; i < grb.length; i++) {

                            snapshot_value = grb[i].slab
                        }

                        slab = snapshot_value
                        console.log(`slab ${slab}`)
                        //finding slab 
                connection.query('select slab_value from tarrif_value_mapping where provider_id = ? AND slab = ? ORDER BY id DESC LIMIT 1',[ provider_id , slab ], (err, rows) => {
                    connection.release()
    
                        if (!err) {
    
                            let grb = JSON.parse(JSON.stringify(rows))
                            console.log(`rows ${rows}`)
                            console.log(`slab ${slab}`)
                            console.log(`provider id ${provider_id}`)
                            let snapshot_value = 0
                            let snapshot = 0
                            for (let i = 0; i < grb.length; i++) {
    
                                snapshot_value = grb[i].slab_value
                                console.log(`sanp shot ${snapshot_value}`)
                            }
    
                            slab_value = snapshot_value
                            console.log(`slab value ${slab_value}`)

                            let bill_Temp =  ( UNIT * slab_value )
                            bill_split = bill_Temp
                            console.log(`bill split ${bill_split}`)

                            bill_total =( bill_split + bill)
                            console.log(`total bill ${bill_total}`)
                            let snapJSON = { value: bill_total }
                            res.send(snapJSON)
    
    
                        } else {
                            res.send(err)
    
                            logger.error("database eoor")
                            logger.error(err)
                            console.log(err)
                        }
                    });

                    } else {
                        res.send(err)

                        logger.error("database eoor")
                        logger.error(err)
                    }
                });

                
            } 
    });