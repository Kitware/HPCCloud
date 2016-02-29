import Monologue from 'monologue.js';
import client from '../index.js';

var myTaskflow,
    tasks = {}, //taskflow tasks
    jobs = {};  //hpc tasks/job


class Observable {}
Monologue.mixInto(Observable);
// const TASKFLOW_CHANNEL = 'TaskFlows';
export const changeDispatcher = new Observable()


//interates through arr and assigns new status from notification
function checkItems(arr, notification) {
    for (let i=0; i < arr.length; i++) {
        if (arr[i]._id === notification._id) {
            arr[i].status = notification.status;
            return true;
        }
    }
    return false;
}

// emit change on monolog
function notifyChange(which) {
    var packet;
    switch (which){
        case 'jobs':
            packet = {jobs};
            break;
        case 'tasks':
            packet = {tasks};
            break;
        default:
            packet = {jobs, tasks};
    }
    changeDispatcher.emit(`${myTaskflow}`, packet);
}


//fetches jobs and tasks
export function fetchItems() {
    client.getTaskflowTaskStatuses(myTaskflow)
        .then((resp) => {
            tasks = resp.data;
            return client.getTaskflow(myTaskflow);
        })
        .then( (resp) => {
            if (resp.data.meta && resp.data.meta.jobs) {
                jobs = resp.data.meta.jobs;
            }
            const promises = jobs.map((job) => {
                return client.getJobStatus(job._id)
                    .then((statusRes) => {
                        job.status = statusRes.data.status;
                    })
                    .catch((err) => {
                        console.log('error fetching job status: ', job._id, err);
                    });
            });
            return Promise.all(promises);
        })
        .then(() => {
            notifyChange();
        })
        .catch((error) => {
            console.log(error);
        });
}

client.onEvent((resp) =>{
    var evt = resp.data,
        type = resp.type,
        update = false;

    //update the jobs or tasks based on notification type
    if (/job/.test(type)) {
        update = checkItems(jobs, evt);
    } else if (/task/.test(type)) {
        update = checkItems(tasks, evt);
    }

    //if nothing was updated check the endpoints for new items.
    //reiterate through them and see if the notification applies to
    //any of the new obejects. Emit changes if there are any.
    if (!update && myTaskflow) {
        if (/job/.test(type)) {
            client.getTaskflow(myTaskflow)
                .then((res) => {
                    if (res.data.meta && res.data.meta.jobs) {
                        jobs = res.data.meta.jobs;
                        update = checkItems(jobs, evt);
                    }
                    if (update) {
                        notifyChange('jobs');
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        } else if (/task/.test(type)) {
            client.getTaskflowTaskStatuses(myTaskflow)
                .then((res) => {
                    tasks = res.data;
                    update = checkItems(tasks, evt);
                    if (update) {
                        notifyChange('tasks');
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }
});

//set the instance's taskflowId
export function setTaskflow(id) {
    myTaskflow = id;
    fetchItems();
}

export function terminateTaskflow(id) {
    return client.endTaskflow(id);
}

export function deleteTaskflow(id) {
    return client.deleteTaskflow(id);
}

export function getJobList(id) {
    return jobs;
}

export function getTaskList(id) {
    return tasks;
}
