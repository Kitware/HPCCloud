import Menu         from '../../panels/SimulationControlPanel';
import PyFrModule   from './index.js';
import React        from 'react';
import style        from 'HPCCloudStyle/PyFrViewSim.mcss';

import { getDeltaStep } from '../helper';

var STEPS = null;

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

    getInitialState() {
        return {
            menuVisible: true,
        }
    },

    toggleMenu() {
        const menuVisible = !this.state.menuVisible;
        this.setState({menuVisible});
    },

    goToProject(){
        this.context.router.replace('/View/Project/' + this.props.project._id);
    },

    previousStep(){
        const prevStep = getDeltaStep(STEPS, this.props.step, -1);
        if(prevStep) {
            this.context.router.replace(['/View/Simulation', this.props.simulation._id, prevStep].join('/'));
        }
    },

    nextStep(){
        const nextStep = getDeltaStep(STEPS, this.props.step, 1);
        if(nextStep) {
            this.context.router.replace(['/View/Simulation', this.props.simulation._id, nextStep].join('/'));
        }
    },

    render() {
        STEPS = PyFrModule.steps._order;

        const prevStep = getDeltaStep(STEPS, this.props.step, -1);
        const nextStep = getDeltaStep(STEPS, this.props.step, 1);
        const componentClass = PyFrModule.steps[this.props.step][this.props.view];
        const component = componentClass ? React.createElement(componentClass, this.props) : null;
        return (
            <div className={ style.container }>
                <div className={ style.subBar}>
                    <span className={ style.left }>
                        <i className={'fa fa-fw fa-chevron-left ' + (prevStep ? style.action : style.disabledAction) } onClick={ this.previousStep }></i>
                        <i className={ 'fa fa-fw fa-bars ' + style.action }  onClick={ this.toggleMenu }></i>
                        <i className={'fa fa-fw fa-chevron-right ' + (nextStep ? style.action : style.disabledAction) } onClick={ this.nextStep }></i>
                    </span>
                    <span className={ style.center }>
                        { this.props.simulation.name }: { this.props.step }
                    </span>
                    <span className={ style.right }>
                        <i className={ 'fa fa-fw fa-arrow-up ' + style.action }  onClick={ this.goToProject }></i>
                    </span>
                </div>
                <div className={ style.content }>
                    <div className={ this.state.menuVisible ? style.sideBarVisible : style.sideBarHidden }>
                        <Menu activeStep={this.props.step} tree={ PyFrModule.menu } simulationId={ this.props.simulation._id }/>
                    </div>
                    <div className={ style.stepContent }>
                        { component }
                    </div>
                </div>
            </div>);
    },
});
