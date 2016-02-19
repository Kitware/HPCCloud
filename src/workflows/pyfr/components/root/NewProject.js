import React                from 'react';
import { FileUploadEntry }  from '../../../../panels/ItemEditor';

export default React.createClass({

    displayName: 'Project/New/PyFr',

    propTypes: {
        owner: React.PropTypes.func,
    },

    render() {
        return <FileUploadEntry name='mesh' label='Mesh file (.msh)' owner={ this.props.owner }/>;
    },
});
