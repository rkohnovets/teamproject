import React, { useState, Fragment } from 'react';
import { Button } from 'reactstrap';

const ButtonWithLoader = (props) => {
    // у props есть text, loadingText, onClick, color (primary, secondary и т.д. из bootstrap)
    let [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        setLoading(true);

        await props.onClick();

        setLoading(false);
    };

    return (
        <React.StrictMode>
            <Button color={props.color ? props.color : "primary"} disabled={loading} onClick={(e) => handleSubmit(e.target)}>

                { loading ?
                        <Fragment>
                            < div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <span> {' ' + props.loadingText} </span>
                        </Fragment> :
                        <span> {props.text} </span> }

            </Button>
        </React.StrictMode>
    );
}

export default ButtonWithLoader;