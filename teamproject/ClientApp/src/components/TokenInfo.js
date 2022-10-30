import React, { useState } from 'react';
import authService from './api-authorization/AuthorizeService'

const TokenInfo = (props) => {
    const [deleted, setDeleted] = useState(false);

    /*const [items, setItems] = useState([]);
    // handle click event of the button to add item
    const addMoreItem = () => {
        setItems(prevItems => [...prevItems, {
            id: prevItems.length,
            value: getRandomNumber()
        }]);
    }*/

    async function deleteYandexToken() {
        const yandexToken = props.yandexToken;
        const token = await authService.getAccessToken();
        const user = await authService.getUser();
        const user_id = user.sub;

        alert(yandexToken + " " + user_id);

        const response = await fetch(`api/YandexTokens/${user_id}/${yandexToken}`, {
            method: 'DELETE',
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        });

        alert("Server response: " + response.status + "; 204 - no content (success), 404 - not found");

        //const data = await response.json();
        setDeleted(true);
    }

    //useEffect(async () => await loadingUsername(), []);

    return (
        <div>
            {deleted ? <p><em>Deleted...</em></p>
                : <p>YandexDirect API Token:<em>{props.yandexToken}</em></p>}
            <a className="btn" onClick={deleteYandexToken}>Delete</a>
        </div>
    );
}

export default TokenInfo;