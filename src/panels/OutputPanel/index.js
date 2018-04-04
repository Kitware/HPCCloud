/* Output panel can display a simple list with a title
TITLE
name1                        value1
name2                        value2
---
or a table with headers
TITLE
headerA    headerB    headerC
name1      someItem   someValue
name2      someItem   someValue
name3      someItem   someValue
*/
import React from 'react';
import PropTypes from 'prop-types';

import style from 'HPCCloudStyle/JobMonitor.mcss';

export default class OutputPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: !props.advanced,
    };
    this.toggleAdvanced = this.toggleAdvanced.bind(this);
    this.tableMapper = this.tableMapper.bind(this);
  }

  toggleAdvanced() {
    this.setState({ open: !this.state.open });
  }

  tableMapper(el, i) {
    return (
      <tr key={el._id}>
        {this.props.headers.map((h) => <td key={`${el._id}_${h}`}>{el[h]}</td>)}
      </tr>
    );
  }

  render() {
    let advancedControl = null;
    if (this.props.advanced) {
      advancedControl = (
        <div className={style.buttons}>
          <span className={style.count}>
            {this.props.subtitle
              ? `${this.props.subtitle}(${this.props.items.length})`
              : null}
          </span>
          <i
            className={
              this.state.open ? style.advancedIconOn : style.advancedIconOff
            }
            onClick={this.toggleAdvanced}
          />
        </div>
      );
    }
    // table layout
    if (this.props.table) {
      return (
        <div>
          <div className={style.toolbar}>
            <div className={style.title}>{this.props.title}</div>
            {advancedControl}
          </div>
          <div
            className={this.state.open ? style.tableContainer : style.hidden}
          >
            <table className={style.table}>
              <thead>
                <tr>
                  {this.props.headers.map((h, i) => (
                    <th key={`${h}_${i}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{this.props.items.map(this.tableMapper)}</tbody>
            </table>
          </div>
        </div>
      );
    }

    // not table layout
    return (
      <div>
        <div className={style.toolbar}>
          <div className={style.title}>{this.props.title}</div>
          {advancedControl}
        </div>
        <div
          className={this.state.open ? style.taskflowContainer : style.hidden}
        >
          {this.props.items.map((el, index) => {
            if (!el) {
              return null;
            }
            return (
              <section key={`${el.name}_${index}`} className={style.listItem}>
                <strong className={style.itemContent}>{el.name}</strong>
                <span>{el.value}</span>
              </section>
            );
          })}
        </div>
      </div>
    );
  }
}

OutputPanel.propTypes = {
  advanced: PropTypes.bool,
  table: PropTypes.bool,
  // if table, headers is an array of strings, these function as header values an keys
  headers: PropTypes.array,
  // if table, items is an array of objects with keys that match the headers array and an _id
  items: PropTypes.array,
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

OutputPanel.defaultProps = {
  advanced: false,
  table: false,
  headers: [],
  items: [],
  title: '',
  subtitle: '',
};
