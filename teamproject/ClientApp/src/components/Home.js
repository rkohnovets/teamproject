import React from 'react';

const Home = (props) => {
    return (
        <div>
        <h1>Yandex Direct accounts balances control</h1>
        <p>This application built with:</p>
        <ul>
            <li><a href='https://get.asp.net/'>ASP.NET Core</a> and <a href='https://msdn.microsoft.com/en-us/library/67ef8sbd.aspx'>C#</a> for cross-platform server-side code</li>
            <li><a href='https://facebook.github.io/react/'>React</a> for client-side code</li>
            <li><a href='http://getbootstrap.com/'>Bootstrap</a> for layout and styling</li>
                <li><a href='https://yandex.ru/dev/direct/'>Yandex Direct API</a> for checking balances</li>
        </ul>
        <p>Using our <code>Teamproject Application</code> you can add all of your Yandex Direct accounts and check their balances in a single page.</p>
        </div>
    );
}

export default Home;
