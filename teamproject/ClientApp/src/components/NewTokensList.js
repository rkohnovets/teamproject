import React, { useState, useEffect, Fragment } from 'react';
import { Button } from 'reactstrap';
import authService from './api-authorization/AuthorizeService';
import NewTokenInfo from './NewTokenInfo';
import Loader from './Loader';
import NewAddToken from './NewAddToken';

const NewTokensList = (props) => {
    const [loading, setLoading] = useState(true);
    const [tokens, setTokens] = useState([]);

    const [balances, setBalances] = useState(new Map());

    const loadTokens = async () => {
        try {
            const token = await authService.getAccessToken();
            const user = await authService.getUser();
            const user_id = user.sub;

            const response = await fetch(`api/YandexTokens/${user_id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status == 401) {
                await authService.signIn();

                alert("session expired, trying to login");

                handleSubmitClick();
            } else {
                const data = await response.json();

                setTokens(data);

                for (let yt of data) {
                    if (!balances.has(yt.token)) {
                        await updateBalance(yt.token);
                    }
                }

                setLoading(false);
            }
        } catch (err) {
            alert(err);
        }
    }

    const updateBalance = async (yandexAPIToken) => {
        try {
            const token = await authService.getAccessToken();

            const response = await fetch(`api/YandexTokens/balance`, {
                method: "POST",
                headers: !token ? {} : {
                    'Authorization': `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(yandexAPIToken)
            });

            //alert(response.status);

            if (response.status == 401) {
                await authService.signIn();

                alert("session expired, trying to login");

                await updateBalance(yandexAPIToken);
            } else {
                let data = await response.json();
                
                if (data.data) {
                    let sum = 0;
                    let currency = data.data.Accounts[0].Currency;

                    for (let i = 0; i < data.data.Accounts.length; i++) {
                        //alert(data.data.Accounts[i].Amount);
                        sum += parseFloat(data.data.Accounts[i].Amount);
                    }

                    setBalances(balances.set(yandexAPIToken, { amount: sum, currency: currency }));
                } else if (data.error_str) {
                    //throw "YandexDirect: " + data.error_str;

                    let str = data.error_str;

                    if (data.error_code == 53) {
                        str += " (invalid token)";
                    }

                    setBalances(balances.set(yandexAPIToken, { amount: str, currency: "" }));
                } else {
                    setBalances(balances.set(yandexAPIToken, { amount: "Unrecognized error", currency: "" }));
                    //throw "unrecognized error (in browser)";
                }

                alert("Updated balance for " + yandexAPIToken);

                //setBalances(balances.set(yandexAPIToken, data.data.Accounts[0].Amount));
            }
        } catch (err) {
            alert(err);
        }
    }

    const deleteToken = (token) => {
        //let indexOfToken = -1;

        //for (let i = 0; i < tokens.length; i++)
        //    if (tokens[i] == token) {
        //        indexOfToken = i;
        //        break;
        //    }

        //newTokens = tokens.splice(indexOfToken, 1);

        //if (indexOfToken == 0 && tokens.length == 1)
        //    newTokens = [];

        //setTokens(newTokens);
        setTokens(tokens.filter(t => t.token != token));
    }

    const addToken = async (yandexToken) => {

        await updateBalance(yandexToken.token);

        setTokens([...tokens, yandexToken]);

        alert("On addToken with: " + yandexToken.token);

        //loadTokens();
    }

    //async ������� ����� ��� ���������� � useEffect
    useEffect(() => {
        (async () => { await loadTokens(); })();
    }, []);

    return (
        <div>
            <div className="d-flex justify-content-between">
                <div className="d-inline-block fs-1"> Your YandexDirect accounts </div>
                <NewAddToken onAdd={addToken} />
            </div>

            {loading ? <div className="d-flex justify-content-center"><Loader /></div> :
                <Fragment> 
                    {tokens.map((yt) =>
                        <Fragment key={yt.token}>
                            <NewTokenInfo onDelete={() => deleteToken(yt.token)}
                                yandexToken={{ token: yt.token, shortName: yt.short_name, description: yt.description }}
                                amount={balances.has(yt.token) ? balances.get(yt.token).amount : "loading"}
                                currency={balances.has(yt.token) ? balances.get(yt.token).currency : "loading"} />
                        </Fragment>
                    )}
                </Fragment>}
        </div>
    );
}

export default NewTokensList;