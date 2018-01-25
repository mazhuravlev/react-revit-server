import React from 'react';
import {CartesianGrid, ComposedChart, Legend, Line, Scatter, Tooltip, XAxis, YAxis} from 'recharts';
import CustomTooltip from "./tooltip";

const moment = require('moment');

export default function Chart2({data}) {
    if (data.length < 1) return (
        <div className='chart'>
            <strong>Слишком мало синхронизаций</strong>
        </div>
    );
    const chartData = data.map(x => ({
        name: 'a',
        sync: x.count,
        year: x.year,
        week: x.week,
        users: x.users,
        size: Math.round(x.modelSize / 1024 / 1024),
        date: moment().year(x.year).week(x.week),
        syncs: x.syncs
    }));
    return (
        <div className='chart'>
            <ComposedChart width={window.innerWidth / 12 * 8 - 40} height={400} data={chartData}>
                <Line name="Размер" type="monotone" yAxisId="left" dataKey="size" stroke="orange"  fill="orange" isAnimationActive={false} />
                <Scatter name="Синхронизации" type="monotone" yAxisId="right" dataKey="sync" stroke="transparent"  fill="rgba(0, 132, 216, 1)" isAnimationActive={false} />
                <CartesianGrid stroke="#ccc"/>
                <YAxis dataKey="sync" yAxisId="right" orientation="right"  />
                <YAxis dataKey="size" yAxisId="left" unit='МБ'/>
                <XAxis dataKey="week"/>
                <Tooltip content={<CustomTooltip/>} isAnimationActive={false} />
                <Legend/>
            </ComposedChart>
        </div>
    );
}