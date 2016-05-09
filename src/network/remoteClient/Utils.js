export function getJSON(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    function extractResponse(ctx) {
      return {
        ctx,
        data: JSON.parse(xhr.responseText),
        status: xhr.status,
        statusText: xhr.statusText,
        headers: {},
        config: {},
      };
    }

    xhr.addEventListener('load', event => {
      resolve(extractResponse('load'));
    });
    xhr.addEventListener('error', event => {
      console.log('Get JSON request failed', event);
      reject(extractResponse('error'));
    });
    xhr.addEventListener('abort', event => {
      console.log('Get JSON request has been canceled', event);
      reject(extractResponse('abort'));
    });

    xhr.open('GET', url, true);
    xhr.responseType = 'text';
    xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
    xhr.send();
  });
}
