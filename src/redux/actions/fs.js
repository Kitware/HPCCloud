import client           from '../../network';
import * as netActions  from './network';

export const CHILDREN_FOLDERS = 'CHILDREN_FOLDERS';
export const CHILDREN_ITEMS = 'CHILDREN_ITEMS';
export const UPDATE_FOLDER = 'UPDATE_FOLDER';

export function updateFolder(folder) {
  return { type: UPDATE_FOLDER, folder, id: folder._id };
}

export function fetchFolder(id, fetchFolderMeta = true) {
  return dispatch => {
    const action = netActions.addNetworkCall(`fetch_folder_${id}`, 'Fetch folder');

    // Update folder
    if (fetchFolderMeta) {
      client.getFolder(id)
        .then(
          resp => {
            const folder = resp.data;
            dispatch(netActions.successNetworkCall(action.id, resp));
            dispatch(updateFolder(folder));
          },
          error => {
            dispatch(netActions.errorNetworkCall(action.id, error));
          });
    }

    // Update children folders
    const folderChildrenAction = netActions.addNetworkCall(`fetch_folder_children_${id}`, 'Fetch folder children (folders)');
    dispatch(folderChildrenAction);
    client.listFolders({ parentId: id, parentType: 'folder' })
      .then(
        resp => {
          const children = resp.data;
          dispatch(netActions.successNetworkCall(folderChildrenAction.id, resp));
          dispatch({ type: CHILDREN_FOLDERS, children, id });
          children.forEach(folder => {
            dispatch(updateFolder(folder));
            dispatch(fetchFolder(folder._id, false));
          });
        },
        error => {
          dispatch(netActions.errorNetworkCall(folderChildrenAction.id, error));
        });


    // Update children items
    const itemChildrenAction = netActions.addNetworkCall(`fetch_item_children_${id}`, 'Fetch folder children (items)');
    dispatch(itemChildrenAction);
    client.listItems({ folderId: id })
      .then(
        resp => {
          const children = resp.data;
          dispatch(netActions.successNetworkCall(itemChildrenAction.id, resp));
          dispatch({ type: CHILDREN_ITEMS, children, id });
        },
        error => {
          dispatch(netActions.errorNetworkCall(itemChildrenAction.id, error));
        });

    return fetchFolderMeta ? action : { type: 'NO_OP' };
  };
}

