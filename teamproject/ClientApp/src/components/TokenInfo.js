import React, { Fragment, useState, useEffect } from 'react';
import { Collapse, Button, ListGroup, ListGroupItem, Badge } from 'reactstrap';
import authService from './api-authorization/AuthorizeService';

import ButtonWithLoader from './ButtonWithLoader';

function TokenInfo(props) {
    // в props есть:
    // sandbox (bool) - в песочнице или нет
    // yandexToken { token, shortName, descriprion } (но будем использовать только token),
    // balanceInfo (структура описана в TokensList),
    // onDelete(вызывается после удаления токена(которое происходит при клике на кнопку))

    const [descrIsOpen, setDescrIsOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(true);
    //const toggle = () => setIsOpen(!isOpen);

    const [accInfo, setAccInfo] = useState();

    const toggleDescr = () => setDescrIsOpen(!descrIsOpen);

    const loadAccInfo = async () => {
        try {
            const yandexToken = props.yandexToken.token;

            const token = await authService.getAccessToken();

            const prefix = props.sandbox ? `api/sandbox/yandextokens/accountinfo` : `api/yandextokens/accountinfo`;

            //получаем информацию об аккаунте
            const response = await fetch(prefix, {
                method: "POST",
                headers: !token ? {} : {
                    'Authorization': `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(yandexToken)
            });

            if (response.status == 401) {
                await authService.signIn();
                alert("session expired, trying to login");
                await loadAccInfo();
            } else {
                let data = await response.json();

                if (data.error) {
                    alert("(loacAccInfo) Error from Yandex Direct server(" + data.error.error_code + "): (" + data.error.error_string + ") " + data.error.error_detail);
                } else {
                    setAccInfo({ "ClientInfo": data.result.Clients[0].ClientInfo, "Login": data.result.Clients[0].Login });

                    //alert("AccountInfo for " + yandexToken + " loaded successfully");
                }
            }
        } catch (err) {
            setAccInfo({ "ClientInfo": "Error", "Login": "Error" });
            alert("In loadAccInfo: " + err);
        }
    }

    const handleDelete = async () => {
        const yandexToken = props.yandexToken.token;

        const token = await authService.getAccessToken();
        const user = await authService.getUser();
        const user_id = user.sub;

        const response = await fetch(`api/YandexTokens/${user_id}/${yandexToken}`, {
            method: 'DELETE',
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        });

        if (response.status == 401) {
            await authService.signIn();

            alert("session expired, trying to login");

            handleDelete();
        }
        else {
            //alert("Server response: " + response.status + "; 204 - no content (success), 404 - not found");

            setIsOpen(false);

            setTimeout(() => props.onDelete(), 1000)
        }
    };

    //async функции нужно так обертывать в useEffect
    useEffect(() => {
        (async () => { await loadAccInfo(); })();
    }, []);

    return (
        <React.StrictMode>
            <Collapse isOpen={isOpen}>
                <div className="d-flex my-1 p-2 justify-content-between border rounded-3">
                    <div className="d-inline-block p-2 fs-5">
                        <strong>{accInfo ? accInfo.ClientInfo + " (" + accInfo.Login + ")" : "Loading..."}</strong>:{' '}
                        {props.balanceInfo.is_agency ? "Agency " : props.balanceInfo.balances[0].Amount + " " + props.balanceInfo.balances[0].Currency + " "}
                        {props.sandbox ? <Badge className="my-auto bg-success">Sandbox</Badge> : <Fragment />}
                    </div>
                    <Button color="primary" className="p-2" outline onClick={toggleDescr}> More </Button>
                </div>
                <Collapse isOpen={descrIsOpen}>
                    <ListGroup className="ms-5">
                        {props.yandexToken.description ?
                            <ListGroupItem>
                                <strong>Description: </strong> {props.yandexToken.description}
                            </ListGroupItem>
                            : <Fragment />}

                        {props.balanceInfo.is_agency
                            ? props.balanceInfo.balances.map((cl) =>
                                <ListGroupItem key={cl.Login}>
                                    {cl.ClientInfo + " (" + cl.Login + ") : " + cl.Amount + " " + cl.Currency}
                                </ListGroupItem>)
                            : <Fragment/>}

                        <ListGroupItem>
                            <div className="d-flex justify-content-between">
                                <div className="d-inline py-2"><strong>YandexDirect API token: </strong> {props.yandexToken.token} </div>
                                <ButtonWithLoader onClick={handleDelete} text="Delete" loadingText="Deleting..." color="danger"/>
                            </div>
                        </ListGroupItem>
                    </ListGroup>
                </Collapse>
            </Collapse>
        </React.StrictMode>
    );
}

export default TokenInfo;