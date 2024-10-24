import React,{Component} from 'react';
import { Route, Redirect } from 'react-router-dom';

import {Routes} from '.././routes'

export default (props) => {

    const { user } = props;
  
    return (user !== null ? <Component {...props} /> : <Redirect to="/sign" />);
};