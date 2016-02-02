import ActiveList   from '../../panels/ActiveList';
import LinkIcon     from '../../widgets/LinkIcon';
import PyFrModule   from './index.js';
import React        from 'react';
import style        from 'HPCCloudStyle/PyFrViewSim.mcss';

export default React.createClass({

    displayName: 'PyFrSimulation',

    propTypes: {
        project: React.PropTypes.object,
        simulation: React.PropTypes.object,
        step: React.PropTypes.string,
        view: React.PropTypes.string,
    },

    contextTypes: {
        router: React.PropTypes.object,
    },

    updateActiveStep(idx, item) {
        this.context.router.replace(['/View/Simulation', this.props.simulation._id, PyFrModule.steps._order[idx]].join('/'));
    },

    render() {
        const componentClass = PyFrModule.steps[this.props.step][this.props.view];
        const component = componentClass ? React.createElement(componentClass, this.props) : null;
        const stepIdx = PyFrModule.steps._order.indexOf(this.props.step);

        return (
            <div className={ style.container }>
                <div className={ style.subBar}>
                    <span className={ style.left }>
                        <LinkIcon to='/' icon='fa fa-fw fa-list'/>
                        <LinkIcon to={ '/View/Project/' + this.props.project._id } icon='fa fa-fw fa-folder-open-o'/>
                    </span>
                    <span className={ style.center }>
                        { this.props.simulation.name }
                    </span>
                    <span className={ style.right }>
                    </span>
                </div>
                <div className={ style.content }>
                    <ActiveList className='seb' list={PyFrModule.menu} active={stepIdx} onActiveChange={this.updateActiveStep}/>
                    <div className={ style.stepContent }>
                        { component }
                    </div>
                </div>
            </div>);
    },
});
