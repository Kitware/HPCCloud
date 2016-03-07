import ClientBuilder        from 'paraviewweb/src/IO/Girder/GirderClientBuilder';
import coreEndpoints        from 'paraviewweb/src/IO/Girder/CoreEndpoints';
import hpcCloudEndpoints    from 'paraviewweb/src/IO/Girder/HpcCloudEndpoints';

const girderClient = ClientBuilder.build(
  window.location, [].concat(coreEndpoints, hpcCloudEndpoints));

export default girderClient;
