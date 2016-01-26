import { createClient } from 'tonic-io/lib/Girder';
import { all } from 'tonic-io/lib/Girder/services';

const girderClient = createClient(window.location, all);

export default girderClient;
