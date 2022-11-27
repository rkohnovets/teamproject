import React, { useState, Fragment } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Input, Label } from 'reactstrap';
import authService from './api-authorization/AuthorizeService';
import ButtonWithLoader from './ButtonWithLoader';

const AddToken = (props) => {
    //props имеет onAdd(yandexToken) (вызывается после успешного добавления токена)

    const [modal, setModal] = useState(false);

    const toggle = () => setModal(!modal);

    const closeBtn = (<button type="button" onClick={toggle} class="btn-close" aria-label="Close"></button>);

    const [tokenToAdd, setTokenToAdd] = useState("");

    const [description, setDescription] = useState("");

    const [forSandbox, setForSandbox] = useState("false");

    let handleSubmitClick = async () => {
        try {
            const token = await authService.getAccessToken();
            const user = await authService.getUser();
            const user_id = user.sub;

            if (!tokenToAdd || tokenToAdd.length === 0)
                throw new Error("Yandex Direct API token cannot be empty!");
            if (!description)
                setDescription("");

            const response = await fetch(`api/YandexTokens`, {
                method: 'POST',
                headers: !token ? {} : {
                    'Authorization': `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'Token': tokenToAdd,
                    'User_id': user_id,
                    "In_sandbox": forSandbox === "true",
                    'Description': description
                })
            });

            if (response.status == 401) {
                alert("session expired, trying to login");

                await authService.signIn();

                await handleSubmitClick();
            }
            else {
                if (response.status == 200) {
                    await props.onAdd({
                        'token': tokenToAdd,
                        'user_id': user_id,
                        "in_sandbox": forSandbox === "true",
                        'description': description
                    });
                } else {
                    throw "Error, server response: " + response.status;
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
                <ModalHeader className="py-1" toggle={toggle} close={closeBtn}>Add new YandexDirect account</ModalHeader>
                <ModalBody className="py-1">
                    <div class="my-1">
                        <label class="form-label">Description (optional)</label>
                        <textarea class="form-control" value={description} onChange={(e) => setDescription(e.target.value)} rows="3"></textarea>
                    </div>

                    <div class="my-1">
                        <label class="form-label">Get Yandex Direct API token here:{' '}
                            <a className="link-primary"
                            href="https://oauth.yandex.ru/authorize?response_type=token&client_id=0765fa3b9c0d4fd79e9cf0e1181ff263"
                            target="_blank">link opens in new tab</a>
                        </label>
                        <input class="form-control" value={tokenToAdd} onChange={(e) => setTokenToAdd(e.target.value)} placeholder="Yandex Direct API token" />
                    </div>

                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" checked={forSandbox === "true"} onChange={(e) => setForSandbox(e.target.checked + "")} />
                        <label class="form-check-label" for="flexSwitchCheckDefault">Sandbox</label>
                    </div>
                </ModalBody>
                <ModalFooter className="py-1">
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