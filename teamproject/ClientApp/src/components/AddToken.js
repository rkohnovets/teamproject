import React from 'react';
import { Input, Button, InputGroup, InputGroupText } from 'reactstrap';
import authService from './api-authorization/AuthorizeService'

const AddToken = (props) => {

    let shortName = "";
    const setShortName = (e) => shortName = e.value;

    let tokenToAdd = "";
    const setTokenToAdd = (e) => tokenToAdd = e.value;

    let handleSubmitClick = async () => {
        try {
            const token = await authService.getAccessToken();
            const user = await authService.getUser();
            const user_id = user.sub;

            if (!shortName || shortName.length === 0)
                throw new Error("");
            if (!tokenToAdd || tokenToAdd.length === 0)
                throw new Error("");

            const response = await fetch(`api/YandexTokens`, {
                method: 'POST',
                headers: !token ? {} : { 'Authorization': `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 'Token': tokenToAdd, 'User_id': user_id })
            });

            //status = response.status;
            //alert("Server response status: " + status);
            //alert(input);

            if (response.status == 200)
                props.update();
        } catch(err) {
            alert(err);
        }
    }

    return (
        <div>
            <a href="https://oauth.yandex.ru/authorize?response_type=token&client_id=0765fa3b9c0d4fd79e9cf0e1181ff263" target="_blank" class="link-primary">Primary link</a>

            <InputGroup>
                <InputGroupText>
                    Short name
                </InputGroupText>
                <Input onChange={(e) => setShortName(e.target)} placeholder="For example, account 1" />
            </InputGroup>
            <InputGroup className="my-3">
                <InputGroupText>
                    YandexDirect API Token
                </InputGroupText>
                <Input onChange={(e) => setTokenToAdd(e.target)} />
                <Button color="primary" onClick={handleSubmitClick}> Add </Button>
            </InputGroup>
        </div>
    );
}

export default AddToken;