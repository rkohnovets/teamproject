import React, { useState, useEffect } from 'react';
import authService from './api-authorization/AuthorizeService'
import TokenInfo from './TokenInfo'
import AddToken from './AddToken'

const TokensList = (props) => {
    const [loading, setLoading] = useState(true);
    const [tokens, setTokens] = useState([]);
   

    const renderTokensTable = (tokens) => {
        return (
            <table className='table table-striped' aria-labelledby="tabelLabel">
            <thead>
                <tr>
                <th>Token Info</th>
                </tr>
            </thead>
            <tbody>
                    <tr> <td><AddToken /></td> </tr>
                    {tokens.map(token => <tr> <td> <TokenInfo yandexToken={token}/> </td> </tr>)}
            </tbody>
            </table>);
    }

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

    useEffect(async () => await loadTokens(), []);

    return (
      <div>
        <h1 id="tabelLabel" >All of your YandexDirect tokens: </h1>
        <p>This component demonstrates fetching data from the server.</p>
        {loading ? <p><em>Loading...</em></p>
      : renderTokensTable(tokens)}
      </div>
    );
}

export default TokensList;
