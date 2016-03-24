import React from 'react';
import style from 'HPCCloudStyle/JobMonitor.mcss';

export default React.createClass({
  displayName: 'OutputPanel',
  propTypes: {
    items: React.PropTypes.array,
    title: React.PropTypes.string,
  },
  getDefaultProps() {
    return {
      items: [],
      title: '',
    };
  },
  render() {
    return (
      <div>
        <div className={ style.title }>{this.props.title}</div>
        {this.props.items.map((el, index) =>
          <section key={`${el.name}_${index}`} className={ style.listItem }>
            <span><strong className={ style.itemContent }>{ el.name }</strong> { el.value }</span>
          </section>
        )}
      </div>
    );
  },
});
