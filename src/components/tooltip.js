import React, {Component} from 'react';
const moment = require('moment');

export default function CustomTooltip({payload}) {
    if (!payload || payload.length < 1) return null;
    const data = payload[0].payload;
    return (
        <div className="ttip">
            <div>{data.sync} синхр.</div>
            <div>{data.size} МБ</div>
            <div>{data.date.format('DD.MM.YY')} - {moment(data.date).add(1, 'w').format('DD.MM.YY')}</div>
            <ul className='user-list'>
                {data.users.map(x => <li key={x}>{x}</li>)}
            </ul>
        </div>
    );
}