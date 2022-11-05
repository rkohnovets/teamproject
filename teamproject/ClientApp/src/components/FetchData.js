import React, { Component } from 'react';
import authService from './api-authorization/AuthorizeService';

export class FetchData extends Component {
  static displayName = FetchData.name;

  constructor(props) {
    super(props);
    this.state = { forecasts: [], loading: true, accessToken: '' };
  }

  componentDidMount() {
    this.populateWeatherData();
  }

  static renderForecastsTable(forecasts) {
    return (
      <table className='table table-striped' aria-labelledby="tabelLabel">
        <thead>
          <tr>
            <th>Date</th>
            <th>Temp. (C)</th>
            <th>Temp. (F)</th>
            <th>Summary</th>
          </tr>
        </thead>
        <tbody>
          {forecasts.map(forecast =>
            <tr key={forecast.date}>
              <td>{forecast.date}</td>
              <td>{forecast.temperatureC}</td>
              <td>{forecast.temperatureF}</td>
              <td>{forecast.summary}</td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }

  render() {
    let contents = this.state.loading
      ? <p><em>Loading...</em></p>
      : FetchData.renderForecastsTable(this.state.forecasts);

    return (
      <div>
        <h1 id="tabelLabel" >Weather forecast</h1>
        <p>This component demonstrates fetching data from the server.</p>
            {contents}
        <p>{this.state.accessToken}</p>
      </div>
    );
  }

    async populateWeatherData() {
        const token = await authService.getAccessToken();
        this.setState({ accessToken: token })

        //
        const user = await authService.getUser();
        //alert(Object.getOwnPropertyNames(user));
        //alert(user.sid + " " + user.preferred_username + " " + user.name + " " + user.sub);
        //alert(token);
        // s_hash,sid,sub,auth_time,idp,amr,preferred_username,name
        /*const resp = await fetch('connect/userinfo', {
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        });
        const res = await resp.text()
        alert(res);*/
        //


        const response = await fetch('weatherforecast', {
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        });
        //alert(response.status);

        if (response.status == 401) {
            //await authService.ensureUserManagerInitialized();
            //await authService.updateState(0);
            //authService.userManager = undefined;
            //await authService.ensureUserManagerInitialized();

            //alert("Updating access token...");

            await authService.signIn();

            await this.populateWeatherData();
        }
        else {
            const data = await response.json();
            //alert(data);
            this.setState({ forecasts: data, loading: false, accessToken: token });
        }
    }
}
