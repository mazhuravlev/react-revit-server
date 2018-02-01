import React, {Component} from 'react';

function getA360Link() {
    const CLIENT_ID = 'qfgik4mhtiZrGPYKMAGXVjyWHdFGqKmA';
    const REDIRECT_URL = 'http://localhost:8091/token';
    const SCOPE = 'data:write';
    return `https://auth.autodesk.com/as/authorization.oauth2?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL}&response_type=code&scope=${SCOPE}`;
}

class UserInfo extends Component {
    render() {
        const {a360: {info}} = this.props;
        if (!info) return (
            <div>
                <a href={getA360Link()}>A360</a>
            </div>
        );
        return (
            <div style={{color: 'white'}}>
                {info.firstName} {info.lastName} <img src={info.profileImages.sizeX40}/>
                <button style={{'marginLeft': '4px'}} className='btn btn-sm btn-default'
                        onClick={() => this.props.onLogout()}>Выйти
                </button>
            </div>
        );
    }
}

export default UserInfo;