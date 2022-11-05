import React from 'react';
import { Input, Button, InputGroup, InputGroupText } from 'reactstrap';
import authService from './api-authorization/AuthorizeService';

const TokenInfo = (props) => {
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

    return (
        <div>
            <InputGroup className="my-3">
                <InputGroupText>
                    YandexDirect API Token: {props.yandexToken}
                </InputGroupText>
                <Button className="block" color="primary" onClick={deleteYandexToken}> Delete </Button>
            </InputGroup>
        </div>
    );
}

export default TokenInfo;