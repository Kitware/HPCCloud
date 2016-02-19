import ActiveList   from '../../../../panels/ActiveList';
import PyFrModule   from './../../index.js';
import React        from 'react';
import Toolbar      from '../../../../panels/Toolbar';

import style            from 'HPCCloudStyle/PageWithMenu.mcss';
import breadCrumbStyle  from 'HPCCloudStyle/Theme.mcss';

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
        const menuList = [];

        PyFrModule.steps._order.forEach(name => {
            console.log('label for', name, PyFrModule.labels);

            menuList.push({
                name,
                label: PyFrModule.labels[name].default,
                disabled: this.props.simulation.steps[name].metadata.disabled,
            });
        });

        return (
            <div className={ style.rootContainer }>
                <Toolbar
                    breadcrumb={{
                        paths:['/', `/View/Project/${this.props.project._id}`, `/View/Simulation/${this.props.simulation._id}`],
                        icons:[
                            breadCrumbStyle.breadCrumbRootIcon,
                            breadCrumbStyle.breadCrumbProjectIcon,
                            breadCrumbStyle.breadCrumbSimulationIcon,
                        ],
                    }}
                    title={ this.props.simulation.name }/>
                <div className={ style.container }>
                    <ActiveList
                        className={ style.menu }
                        list={menuList}
                        active={stepIdx}
                        onActiveChange={this.updateActiveStep}/>
                    <div className={ style.content }>
                        { component }
                    </div>
                </div>
            </div>);
    },
});
