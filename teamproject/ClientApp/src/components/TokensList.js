import React, { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import authService from './api-authorization/AuthorizeService';
import TokenInfo from './TokenInfo';
import AddToken from './AddToken';

const TokensList = (props) => {
    const [loading, setLoading] = useState(true);
    const [tokens, setTokens] = useState([]);

    const loadTokens = async () => {
        const token = await authService.getAccessToken();
        const user = await authService.getUser();
        const user_id = user.sub;

        const response = await fetch(`api/YandexTokens/${user_id}`, {
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        });

        alert(response.status);

        const data = await response.json();

        alert(data);

        setTokens(data);
        setLoading(false);
    }

    //async функции нужно так обертывать в useEffect
    useEffect(() => {
        (async () => {
            await loadTokens();
        })();
    }, []);

    return (
        <div>
            <h1> Your YandexDirect accounts </h1>
            <Button color='success' onClick={loadTokens}>Load Tokens</Button>
            {loading ? <p><em>Loading...</em></p>
                : 
                <table className='table table-striped' aria-labelledby="tabelLabel">
                    <thead>
                        <tr>
                            <th>Token Info</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr> <td><AddToken/></td> </tr>
                        {tokens.map(token => <tr> <td> <TokenInfo update={loadTokens} yandexToken={token} /> </td> </tr>)}
                    </tbody>
                </table>
                }
        </div>
    );
}

export default TokensList;
