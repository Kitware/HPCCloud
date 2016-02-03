import React    from 'react';
import LinkIcon from '../LinkIcon';

const DEFAULT_BREADCRUMB_ICONS = [
    'fa fa-fw fa-list',
    'fa fa-fw fa-folder-open-o',
    'fa fa-fw fa-file-text-o',
    'fa fa-fw fa-question',
    'fa fa-fw fa-question',
    'fa fa-fw fa-question',
    'fa fa-fw fa-question',
    'fa fa-fw fa-question',
];

export default React.createClass({
    displayName: 'LinkIcon',

    propTypes: {
        className: React.PropTypes.string,
        icons: React.PropTypes.array,
        paths: React.PropTypes.array,
    },

    getDefaultProps() {
        return {
            icons: DEFAULT_BREADCRUMB_ICONS,
        };
    },

    render() {
        return (
            <div className={ this.props.className }>
                {this.props.paths.map((path, index) => {
                    return <LinkIcon key={index} to={path} icon={this.props.icons[index]}/>
                })}
            </div>);
    },
})
