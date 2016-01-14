import React         from 'react';
import ListPanel     from '../../../panels/ListPanel';
import LineListItems from '../../../panels/LineListItems';
import ProjectItem   from './Item';
import values        from 'mout/src/object/values';

import ServerLessData from '../../../config/ServerLessData';

export default React.createClass({

    displayName: 'Project/All',

    render() {
        return <ListPanel
                    listComponent={ LineListItems }
                    itemRenderer={ ProjectItem }
                    list={ values(ServerLessData.projects) }
                    add='/New/Project'
                    title='Project list'/>;
    },
});
