import React from 'react';
import { Button } from 'reactstrap';
import authService from './api-authorization/AuthorizeService';

const TokenInfo = (props) => {
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

        if (response.status == 204)
            props.update();
    }

    //useEffect(async () => await loadingUsername(), []);

    return (
        <div>
            <p>YandexDirect API Token:<em>{props.yandexToken}</em></p>
            <Button color='primary' onClick={deleteYandexToken}>Delete</Button>
        </div>
    );
}

export default TokenInfo;