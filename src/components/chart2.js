import React from 'react';
import {CartesianGrid, ComposedChart, Legend, Line, Scatter, Tooltip, XAxis, YAxis} from 'recharts';
import CustomTooltip from "./tooltip";

export default function Chart2({chartData}) {
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