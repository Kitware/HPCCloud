import React    from 'react';
import { Link } from 'react-router';
import style    from 'hpccloud/style/Menu.mcss';

export default React.createClass({

    displayName: 'SimulationControl',

    propTypes: {
        activeStep: React.PropTypes.string,
        simulationId: React.PropTypes.string,
        tree: React.PropTypes.array,
    },

    linkChild(child) {
        return (
            <li key={ child.link } className={ style.link }>
                <Link to={ child.link.replace(/ID/g, this.props.simulationId) }>{child.label}</Link>
                { this.props.activeStep === child.step ? <i className='fa fa-fw fa-hand-o-left'></i> : null }
            </li>);
    },

    parentChild(item) {
        return (
            <li key={ item.label } className={ style.group }>
                {item.label}
                <ul>
                    { item.children.map( child => {
                        return this.linkChild(child);
                    })}
                </ul>
            </li>);
    },

    render() {
        return (
            <ul className={ style.root }>
                { this.props.tree.map( item => {
                    return item.children ? this.parentChild(item) : this.linkChild(item);
                })}
            </ul>);
    },
});
