import client           from '../../network';
import * as netActions  from './network';

export const UPDATE_FOLDER = 'UPDATE_FOLDER';
export const UPDATE_ITEMS = 'UPDATE_ITEMS';
export const CHILDREN_FOLDERS = 'CHILDREN_FOLDERS';
export const CHILDREN_ITEMS = 'CHILDREN_ITEMS';
export const TOGGLE_OPEN_FOLDER = 'TOGGLE_OPEN_FOLDER';
export const TOGGLE_FILE_SELECTION = 'TOGGLE_FILE_SELECTION';
export const CLEAR_FILE_SELECTION = 'CLEAR_FILE_SELECTION';

export function updateFolder(folder) {
  return { type: UPDATE_FOLDER, folder, id: folder._id };
}

export function updateItems(items) {
  return { type: UPDATE_ITEMS, items };
}

export function fetchFolder(id, fetchFolderMeta = true, openedFolders = []) {
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

export function toggleOpenFolder(folderId, opening) {
  return dispatch => {
    if (opening) {
      dispatch(fetchFolder(folderId));
    }
    return { type: TOGGLE_OPEN_FOLDER, folderId };
  };
}

export function toggleFileSelection(fileId) {
  return { type: TOGGLE_FILE_SELECTION, fileId };
}

export function clearFileSelection() {
  return { type: CLEAR_FILE_SELECTION };
}

export function moveFilesOffline(items) {
  const promises = items.map((id) => client.listFiles(id));
  return dispatch => {
    Promise.all(promises) // get files for each item
      .then((files) => client.moveFilesOffline(files.reduce((prev, cur) => prev.concat(cur.data), [])))
      .then((resp) => {
        if (process.env.NODE_ENV !== 'production') console.log('transfer complete');
        // update item meta
        return Promise.all(items.map((id) => client.updateItemMetadata(id, { offline: true })));
      })
      .then((newItems) => {
        // update local items
        console.log(newItems);
        dispatch(updateItems(newItems.map(el => el.data)));
        dispatch(clearFileSelection());
      });
    return { type: 'NO_OP' };
  };
}
