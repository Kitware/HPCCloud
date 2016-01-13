import React         from 'react';
import ListPanel     from '../../../panels/ListPanel';
import LineListItems from '../../../panels/LineListItems';
import ProjectItem   from './Item';

const demoList = [
    { id: '123', name: 'First project' },
    { id: '222', name: 'Second project' },
    { id: '332', name: 'Third project' },
    { id: '432', name: 'Another project' },
    { id: '567', name: 'Last project' },
];

export default React.createClass({

    displayName: 'Project/All',

    render() {
        return <ListPanel listComponent={ LineListItems } itemRenderer={ ProjectItem } list={ demoList } add='/New/Project' title='Project list'/>;
    },
});
