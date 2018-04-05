import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import prefStyle from 'HPCCloudStyle/Preferences.mcss';
import style from 'HPCCloudStyle/PageWithMenu.mcss';

import Toolbar from '../../../panels/Toolbar';
import OutputPanel from '../../../panels/OutputPanel';
import { breadcrumb } from '..';

const clusterBreadCrumb = Object.assign({}, breadcrumb, { active: 4 });
const iconMap = {
  pending: prefStyle.networkPendingIcon,
  success: prefStyle.networkSuccessIcon,
  error: prefStyle.networkErrorIcon,
};

function networkMapper(el, index) {
  return {
    name: (
      <span title={JSON.stringify(el, null, '  ')}>
        <i className={iconMap[el.state]} /> {el.label ? el.label : '__'}
      </span>
    ),
    value: <span>{el.state}</span>,
  };
}

export function StatusPage(props) {
  return (
    <div className={style.rootContainer}>
      <Toolbar breadcrumb={clusterBreadCrumb} title="Network" hasTabs />
      <div className={style.container}>
        <div className={style.content}>
          <OutputPanel
            items={props.log.map(networkMapper)}
            title="Network log"
          />
        </div>
      </div>
    </div>
  );
}

StatusPage.propTypes = {
  log: PropTypes.array,
};

StatusPage.defaultProps = {
  log: [],
};

// Binding

export default connect((state) => {
  const localState = state.network;
  const log = []
    .concat(
      localState.backlog,
      Object.keys(localState.pending).map((id) =>
        Object.assign({ state: 'pending' }, localState.pending[id])
      ),
      Object.keys(localState.success).map((id) =>
        Object.assign({ state: 'success' }, localState.success[id])
      ),
      Object.keys(localState.error).map((id) =>
        Object.assign({ state: 'error' }, localState.error[id])
      )
    )
    .sort((a, b) => Number(b.ts) - Number(a.ts));
  // console.log(log);
  return {
    log,
  };
})(StatusPage);
