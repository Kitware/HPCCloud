import React                from 'react';
import { FileUploadEntry }  from '../../../../panels/ItemEditor';

export default React.createClass({

    displayName: 'Simulation/New/Visualizer',

    propTypes: {
        owner: React.PropTypes.func,
    },

    render() {
        return <FileUploadEntry name='dataset' label='Result file' owner={ this.props.owner }/>;
    },
});
