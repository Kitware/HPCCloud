// this formatter takes a decimal that represents time in unix seconds
export function formatTime(time) {
  const date = new Date(time * 1000);
  let hours = date.getHours().toString();
  let minutes = date.getMinutes().toString();
  let seconds = date.getSeconds().toString();
  let ms = date.getMilliseconds().toString();

  hours = hours.length === 1 ? `0${hours}` : hours;
  minutes = minutes.length === 1 ? `0${minutes}` : minutes;
  seconds = seconds.length === 1 ? `0${seconds}` : seconds;
  while (ms.length < 3) {
    ms = `0${ms}`;
  }

  return `${hours}:${minutes}:${seconds}.${ms}`;
}

export function formatFileSize(bytes, precision = 1) {
  const nBytes = Number(bytes);
  if (Number.isNaN(nBytes) || !Number.isFinite(nBytes)) {
    return 'unknown size';
  } else if (nBytes === 0) {
    return '0 bytes';
  }
  const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const number = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** Math.floor(number)).toFixed(precision)} ${
    units[number]
  }`;
}

export default {
  formatTime,
};
