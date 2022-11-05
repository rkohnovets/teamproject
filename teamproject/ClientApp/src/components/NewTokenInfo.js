import React, { Fragment, useState } from 'react';
import { Collapse, Button, ListGroup, ListGroupItem } from 'reactstrap';
import authService from './api-authorization/AuthorizeService';

import ButtonWithLoader from './ButtonWithLoader';
import Loader from './Loader';

function NewTokenInfo(props) {
    // в props есть: yandexToken { token, shortName, descriprion }, 
    // amount (баланс), currency(валюта), accCount(кол - во аккаунтов),
    // onDelete(вызывается после удаления токена(которое происходит при клике на кнопку))

    const [descrIsOpen, setDescrIsOpen] = useState(false);
    const toggleDescr = () => setDescrIsOpen(!descrIsOpen);

    const [isOpen, setIsOpen] = useState(true);
    //const toggle = () => setIsOpen(!isOpen);

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

    return (
        <React.StrictMode>
            <Collapse isOpen={isOpen}>
                <div className="d-flex my-1 p-2 justify-content-between border rounded-3">
                    <div className="d-inline-block p-2 fs-5"> <strong>{props.yandexToken.shortName} : </strong> {props.amount + ' ' + props.currency} </div>
                    <Button color="primary" className="p-2" outline onClick={toggleDescr}> More </Button>
                </div>
                <Collapse isOpen={descrIsOpen}>
                    <ListGroup className="ms-5">
                        {props.yandexToken.description ?
                            <ListGroupItem>
                                <strong>Description: </strong> {props.yandexToken.description}
                            </ListGroupItem>
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

export default NewTokenInfo;