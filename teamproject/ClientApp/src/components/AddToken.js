import React, { useState, Fragment } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import authService from './api-authorization/AuthorizeService';
import ButtonWithLoader from './ButtonWithLoader';

const AddToken = (props) => {
    //props имеет onAdd(yandexToken) (вызывается после успешного добавления токена)

    const [modal, setModal] = useState(false);

    const toggle = () => setModal(!modal);

    const closeBtn = (<button type="button" onClick={toggle} class="btn-close" aria-label="Close"></button>);

    let shortName = "";
    const setShortName = (e) => shortName = e.value;

    let tokenToAdd = "";
    const setTokenToAdd = (e) => tokenToAdd = e.value;

    let description = "";
    const setDescription = (e) => description = e.value;

    let handleSubmitClick = async () => {
        try {
            const token = await authService.getAccessToken();
            const user = await authService.getUser();
            const user_id = user.sub;

            if (!shortName || shortName.length === 0)
                throw new Error("Short name cannot be empty!");
            if (!tokenToAdd || tokenToAdd.length === 0)
                throw new Error("Yandex Direct API token cannot be empty!");
            if (!description)
                description = '';

            const response = await fetch(`api/YandexTokens`, {
                method: 'POST',
                headers: !token ? {} : {
                    'Authorization': `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'Token': tokenToAdd,
                    'User_id': user_id,
                    'Short_name': shortName,
                    'Description': description
                })
            });

            if (response.status == 401) {
                alert("session expired, trying to login");

                await authService.signIn();

                handleSubmitClick();
            }
            else {
                if (response.status == 200) {
                    await props.onAdd({
                        'token': tokenToAdd,
                        'user_id': user_id,
                        'short_name': shortName,
                        'description': description
                    });
                } else {
                    throw "error, server response " + response.status;
                }
                toggle();
            }
        } catch (err) {
            alert(err);
        }
    }

    return (
        <Fragment>
            <Button onClick={toggle} color="primary" outline>
                Add new
            </Button>
            <Modal isOpen={modal} toggle={toggle}>
                <ModalHeader toggle={toggle} close={closeBtn}>Add new YandexDirect account</ModalHeader>
                <ModalBody>
                    <div class="mb-3">
                        <label class="form-label">Short Name</label>
                        <input class="form-control" onChange={(e) => setShortName(e.target)} placeholder="for example, account 1"/>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Description (optional)</label>
                        <textarea class="form-control" onChange={(e) => setDescription(e.target)} rows="3"></textarea>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Get Yandex Direct API token here:{' '}
                            <a className="link-primary"
                            href="https://oauth.yandex.ru/authorize?response_type=token&client_id=0765fa3b9c0d4fd79e9cf0e1181ff263"
                            target="_blank">link opens in new tab</a>
                        </label>
                        <input class="form-control" onChange={(e) => setTokenToAdd(e.target)} placeholder="Yandex Direct API token" />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <ButtonWithLoader onClick={handleSubmitClick} text="Submit" loadingText="Submitting..."/>
                    {' '}
                    <Button color="secondary" onClick={toggle}>
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>
        </Fragment>
    );
}

export default AddToken;