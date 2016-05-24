import assetstore  from './remote/assetstore';
import aws         from './remote/aws';
import clusters    from './remote/clusters';
import collection  from './remote/collection';
import file        from './remote/file';
import folder      from './remote/folder';
import group       from './remote/group';
import item        from './remote/item';
import jobs        from './remote/jobs';
import projects    from './remote/projects';
import resource    from './remote/resource';
import simulations from './remote/simulations';
import system      from './remote/system';
import taskflows   from './remote/taskflows';
import tasks       from './remote/tasks';
import user        from './remote/user';

import ClientBuilder from './remote/GirderClient';

const endpoints = [
  assetstore,
  aws,
  clusters,
  collection,
  file,
  folder,
  group,
  item,
  jobs,
  projects,
  resource,
  simulations,
  system,
  taskflows,
  tasks,
  user,
];

const girderClient = ClientBuilder.build(
  window.location, endpoints);

export default girderClient;
