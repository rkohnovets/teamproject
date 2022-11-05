import React, { useState, Fragment } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import authService from './api-authorization/AuthorizeService';
import ButtonWithLoader from './ButtonWithLoader';

function Example(props) {

    let handleSubmitClick = async () => {
        try {
            const token = await authService.getAccessToken();

            const response = await fetch(`api/YandexTokens/balance`, {
                method: "POST",
                headers: !token ? {} : {
                    'Authorization': `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify("AQAAAABgnkudAAfhe1NaPuIsDEWOg1-x0Xawiro")
            });

            alert(response.status);

            if (response.status == 401) {
                await authService.signIn();

                alert("session expired, trying to login");

                handleSubmitClick();
            }
            else {
                let data = await response.json();

                alert(data);
            }
        } catch (err) {
            alert(err);
        }
    }

    return (
        <Fragment>
            <Button onClick={handleSubmitClick} color="primary" outline>
                Post and get response
            </Button>
        </Fragment>
    );
}

export default Example;