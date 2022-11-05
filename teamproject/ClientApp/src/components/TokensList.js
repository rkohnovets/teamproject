import React, { useState, useEffect, Fragment } from 'react';
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
        (async () => { await loadTokens(); })();
    }, []);

    return (
        <div>
            <h1> Your YandexDirect accounts </h1> -- TODO aside button ADD NEW

            {loading ? <p><em>Loading...</em></p> :
                <Fragment>
                    <AddToken update={loadTokens}/>
                    <h1>Token Info</h1>
                            {tokens.map(token => <tr> <td>
                                <div className="d-flex bg-info m-2 p-2 justify-content-between">
                                    <div className="d-inline p-2 m-2 bg-success text-white">d-inline</div>
                                    <div className="d-inline p-2 m-2 bg-dark text-white">d-inline</div>
                                    <TokenInfo update={loadTokens} yandexToken={token} />
                                </div>
                            </td> </tr>)}
                </Fragment>}

        </div>
    );
}

export default TokensList;
