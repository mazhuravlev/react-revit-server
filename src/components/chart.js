import React, {Component} from 'react';
import {Sparklines, SparklinesLine, SparklinesReferenceLine} from "react-sparklines";
import * as _ from 'lodash';

export default function Chart({data, color}) {
    if (data.length < 4) return (
        <div className='chart'>
            <strong>Слишком мало синхронизаций</strong>
        </div>
    );
    const avg = Math.round((data.reduce((a, c) => a + c, 0) / data.length) / 1024 / 1024);
    const min = Math.round(_.min(data) / 1024 / 1024);
    const max = Math.round(_.max(data) / 1024 / 1024);
    return (
        <div className='chart'>
            <div><strong>Среднее {avg} МБ</strong></div>
            <strong>Макс {max} МБ</strong>
            <Sparklines data={data} width={400} height={200}>
                <SparklinesLine style={{stroke: "#559500", fill: "#8fc638", fillOpacity: "0.5"}}/>
                <SparklinesReferenceLine type="avg"/>
            </Sparklines>
            <strong>Мин {min} МБ</strong>
        </div>
    );
}