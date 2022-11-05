import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import Home from './components/Home';
import { FetchData } from './components/FetchData';
import TokensList from './components/TokensList';
import { Counter } from './components/Counter';
import AuthorizeRoute from './components/api-authorization/AuthorizeRoute';
import ApiAuthorizationRoutes from './components/api-authorization/ApiAuthorizationRoutes';
import { ApplicationPaths } from './components/api-authorization/ApiAuthorizationConstants';
import './index.css';

import NewTokensList from './components/NewTokensList';

const App = (props) => {
    return (
        <Layout>
        <Route exact path='/' component={Home} />
        <AuthorizeRoute path='/new-tokens-list' component={NewTokensList} />
        <Route path={ApplicationPaths.ApiAuthorizationPrefix} component={ApiAuthorizationRoutes} />
        </Layout>
    );
}

export default App;