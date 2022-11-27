import React, { useState, useEffect, Fragment } from 'react';
import authService from './api-authorization/AuthorizeService';
import TokenInfo from './TokenInfo';
import Loader from './Loader';
import AddToken from './AddToken';

import { Alert } from 'reactstrap';

const TokensList = (props) => {
    const [loading, setLoading] = useState(true);
    const [tokens, setTokens] = useState([]);

    const [balancesInfos, setBalancesInfos] = useState(new Map());

    /*
    Структура объектов в массиве balancesInfos:
    {
        (агенство или обычный аккаунт)
        is_agency: bool,
        (если обычный аккаунт, то в balances один элемент)
        balances: [
            {
                Currency: string,
                Amount: number,
                ClientInfo: string (если обычный аккаунт, то нету)
                Login: string (если обычный аккаунт, то нету)
            }
        ]
    }
    */

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
                await loadTokens();
            } else {
                const data = await response.json();

                setTokens(data);

                for (let yt of data) {
                    //alert("Props of yandexToken: " + Object.getOwnPropertyNames(yt));

                    if (!balancesInfos.has(tokenToString(yt))) {
                        await updateBalance(yt);
                    }
                }

                setLoading(false);
            }
        } catch (err) {
            alert(err);
        }
    }

    const tokenToString = (yandexToken) => yandexToken.token + "-" + yandexToken.in_sandbox;

    const updateBalance = async (yandexToken) => {
        try {
            const token = await authService.getAccessToken();

            //получаем информацию, агентство ли это, и если агентство,
            //то какие у него клиенты

            let prefix = yandexToken.in_sandbox ? `api/sandbox/yandextokens/` : `api/yandextokens/`;

            const response = await fetch(prefix + "agencyclients", {
                method: "POST",
                headers: !token ? {} : {
                    'Authorization': `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(yandexToken.token)
            });

            if (response.status == 401) {
                await authService.signIn();
                alert("session expired, trying to login");
                await updateBalance(yandexToken);
            } else {
                let data = await response.json();

                // проверка на ошибку не нужна, is_agency будет в любом случае и покажет,
                // если true, то это агенство, если false - то это или обычный аккаунт, или токен не походит
                if (data.is_agency) {

                    let logins = [];
                    for (let i = 0; i < data.result.Clients.length; i++) {
                        logins.push(data.result.Clients[i].Login);
                    }

                    // получаем информацию о балансах клиентов агентства
                    let body = { "token": yandexToken.token, "logins": logins };
                    const response2 = await fetch(prefix + `agencyclients/balances`, {
                        method: "POST",
                        headers: !token ? {} : {
                            'Authorization': `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(body)
                    });

                    let data2 = await response2.json();

                    // TODO if(data2.error) - то есть если сервер яндект директа 
                    // вернул в ответе { error: { error_code, error_detail, error_string } }
                    if (data.error_str) {
                        alert("(updateBalance) Error from Yandex Direct server("
                            + data.error_code + "): ("
                            + data.error_str + ") "
                            + data.error_detail);
                    } else {
                        let clientsBalances = [];

                        //alert(JSON.stringify(data2));

                        for (let i = 0; i < data2.data.Accounts.length; i++) {
                            let balanceInfo = data2.data.Accounts[i];
                            let Login = balanceInfo.Login;
                            let ClientInfo = "ClientInfo not found";

                            for (let j = 0; j < data.result.Clients.length; j++) {
                                let client = data.result.Clients[j];
                                if (client.Login == Login) {
                                    ClientInfo = client.ClientInfo;
                                    break;
                                }
                            }

                            clientsBalances.push({
                                "Login": Login,
                                "ClientInfo": ClientInfo,
                                "Currency": balanceInfo.Currency,
                                "Amount": balanceInfo.Amount
                            });
                        }

                        setBalancesInfos(balancesInfos.set(tokenToString(yandexToken), { "is_agency": true, "balances": clientsBalances }));
                    }
                } else {
                    const response = await fetch(prefix + `balance`, {
                        method: "POST",
                        headers: !token ? {} : {
                            'Authorization': `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(yandexToken.token)
                    });

                    if (response.status == 401) {
                        await authService.signIn();

                        alert("session expired, trying to login");

                        await updateBalance(yandexToken);
                    } else {
                        let data = await response.json();
                        if (data.error_str) {
                            let str = data.error_str;

                            if (data.error_code == 53 || data.error_code == 8000) {
                                str += " (invalid token)";
                            }

                            setBalancesInfos(balancesInfos.set(tokenToString(yandexToken),
                                { "is_agency": false, "balances": [{ "Amount": str, "Currency": "" }] }));
                        } else {
                            let amount = data.data.Accounts[0].Amount;
                            let currency = data.data.Accounts[0].Currency;

                            setBalancesInfos(balancesInfos.set(tokenToString(yandexToken),
                                { "is_agency": false, "balances": [{ "Amount": amount, "Currency": currency }] }));
                        }
                    }
                }
            }
        } catch (err) {
            alert("Error in updateBalance: " + err);
        }
    }

    const deleteToken = (yandexToken) => {
        // правильное ли условие ?
        setTokens(tokens.filter(t => t.token != yandexToken.token || t.in_sandbox != yandexToken.in_sandbox));
    }

    const addToken = async (yandexToken) => {
        await updateBalance(yandexToken);

        setTokens([...tokens, yandexToken]);
    }

    //async функции нужно так обертывать в useEffect
    useEffect(() => {
        (async () => { await loadTokens(); })();
    }, []);

    return (
        <div>
            <div className="d-flex justify-content-between">
                <div className="d-inline-block fs-1"> Your Yandex Direct accounts </div>
                <AddToken onAdd={addToken} />
            </div>

            {loading ? <div className="d-flex justify-content-center"><Loader /></div> :
                <Fragment>
                    {tokens.length
                        ? tokens.map((yt) =>
                            <Fragment key={tokenToString(yt)}>
                                <TokenInfo onDelete={() => deleteToken(yt)}
                                    sandbox={yt.in_sandbox}
                                    yandexToken={{ token: yt.token, description: yt.description }}
                                    balanceInfo={balancesInfos.has(tokenToString(yt))
                                        ? balancesInfos.get(tokenToString(yt))
                                        : { is_agency: false, balances: [{ Amount: "Loading", Currency: "" }] }} />
                            </Fragment>)
                        : <Alert color="primary" className="my-1"> You have no accounts yet. Add some! </Alert>}
                </Fragment>}
        </div>
    );
}

export default TokensList;
