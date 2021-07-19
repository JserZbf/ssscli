import React, { useEffect } from 'react';
import { connect } from 'dva';

const Router1 = function ({ getVirtualmeterList }) {
  useEffect(() => {
    getVirtualmeterList();
  }, [getVirtualmeterList]);

  return <div>Router1</div>;
};

export default connect(
  () => ({}),
  (dispatch) => ({
    getVirtualmeterList: (payload) => dispatch({ type: 'homeCenter/getVirtualmeterList', payload }),
  }),
)(Router1);
