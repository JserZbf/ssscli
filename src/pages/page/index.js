import React, { useEffect } from 'react';
import { connect } from 'dva';

const Home = function ({ getVirtualmeterList }) {
  useEffect(() => {
    // getVirtualmeterList();
  }, [getVirtualmeterList]);

  return <div>HOME</div>;
};

export default connect(
  () => ({}),
  (dispatch) => ({
    getVirtualmeterList: (payload) => dispatch({ type: 'homeCenter/getVirtualmeterList', payload }),
  }),
)(Home);
