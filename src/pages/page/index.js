import React from 'react';
import { Redirect } from 'umi';
import pathConfig from 'config/pathConfig';

const index = () => {
  return <Redirect to={pathConfig.router1.path} />;
};

export default index;
