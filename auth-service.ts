import start from './tracer';
const meter = start('auth-service');

import opentelemetry from "@opentelemetry/api";
import express from 'express';
const app = express();

const calls = meter.createHistogram('http-calls');

app.use((req,res,next)=>{
    const startTime = Date.now();
    req.on('end',()=>{
        const endTime = Date.now();
        calls.record(endTime-startTime,{
            route: req.route?.path,
            status: res.statusCode,
            method: req.method
        })
    })
    next();
})

app.get('/auth',(req,res)=>{
    res.json({username: 'Michael Haberman', userId: 123});
    const span = opentelemetry.trace.getActiveSpan();
    span?.setAttribute('userId', 123);
})

app.listen(8080, () => {
    console.log('service is up and running!');
})