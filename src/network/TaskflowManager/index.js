import Monologue from 'monologue.js';
import client from '../index.js';

var taskflows = {},
    tasks = {}, //taskflow tasks
    jobs = {};  //hpc tasks/job

const typeMapping = {
    job: jobs,
    task: tasks,
};

class Observable {}
Monologue.mixInto(Observable);
const changeDispatcher = new Observable()

// emit change on monolog
function notifyChange(taskflowId) {
    const event = { jobs: [] },
        taskflow = taskflows[taskflowId];

    // Fill events with tasks and jobs
    if(taskflow && taskflow.tasks && taskflow.flow) {
        event.tasks = taskflow.tasks;
        if(taskflow.flow.meta && taskflow.flow.meta.jobs) {
            taskflow.flow.meta.jobs.forEach(job => {
                if(jobs[job._id]) {
                    event.jobs.push(jobs[job._id]);
                }
            })
        }

        changeDispatcher.emit(taskflowId, event);
    }
}

function onEventUpdate(type, event) {
    const typeMap = type.split('.');

    if(!typeMapping[typeMap[0]]) {
        return null;
    }

    const obj = typeMapping[typeMap[0]][event._id];
    if(obj) {
        obj.status = event.status;
        if(obj.__taskflowId) {
            notifyChange(obj.__taskflowId);
        }
    }
    return obj;
}

function updateJobStatus(taskflowId, jobId) {
    client.getJobStatus(jobId)
        .then( resp => {
            jobs[jobId].status = resp.data.status
            notifyChange(taskflowId);
        });
}

function updateTaskFlow(taskflowId) {
    if(!taskflows[taskflowId]) {
        taskflows[taskflowId] = {};
    }

    client.getTaskflowTaskStatuses(taskflowId)
        .then( resp => {
            taskflows[taskflowId].tasks = resp.data;
            taskflows[taskflowId].tasks.forEach(task => {
                tasks[task._id] = task;
                task.__taskflowId = taskflowId;
            });
            notifyChange(taskflowId);
        });

    client.getTaskflow(taskflowId)
        .then( resp => {
            taskflows[taskflowId].flow = resp.data;

            if(taskflows[taskflowId].flow && taskflows[taskflowId].flow.meta && taskflows[taskflowId].flow.meta.jobs) {
                resp.data.meta.jobs.forEach( job => {
                    jobs[job._id] = job;
                    job.__taskflowId = taskflowId;
                    updateJobStatus(taskflowId, job._id);
                });
            }

        });
}

client.onEvent((resp) =>{
    // update the jobs or tasks based on notification type
    const obj = onEventUpdate(resp.type, resp.data);

    //if nothing was updated check the endpoints for new items.
    if (!obj) {
        // Let's refresh all taskflows
        for(const taskflowId in taskflows) {
            updateTaskFlow(taskflowId);
        }
    }
});

//set the instance's taskflowId
export function monitorTaskflow(id, callback) {
    if(!taskflows[id]) {
        taskflows[id] = {};
        updateTaskFlow(id);
    } else {
        setImmediate(()=>{
            notifyChange(id);
        });
    }

    return changeDispatcher.on(id, callback);
}

export function unmonitorTaskflow(id) {
    changeDispatcher.off(id);
    const taskflow = taskflows[id];
    if(taskflow && taskflow.flow && taskflow.flow.meta && taskflow.flow.meta.jobs) {
        taskflow.flow.meta.jobs.forEach(job => {
            delete jobs[job._id];
        })
    }
    if(taskflow && taskflow.tasks) {
        taskflow.tasks.forEach(task => {
            delete tasks[task._id];
        })
    }
    delete taskflows[id];
}

export function terminateTaskflow(id) {
    return client.endTaskflow(id);
}

export function deleteTaskflow(id) {
    unmonitorTaskflow(id);
    return client.deleteTaskflow(id);
}

export default {
    monitorTaskflow,
    unmonitorTaskflow,
    terminateTaskflow,
    deleteTaskflow,
}
