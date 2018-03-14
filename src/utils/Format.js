// this formatter takes a decimal that represents time in unix seconds
export function formatTime(time) {
  var date = new Date(time * 1000),
    hours = date.getHours().toString(),
    minutes = date.getMinutes().toString(),
    seconds = date.getSeconds().toString(),
    ms = date.getMilliseconds().toString();

  hours = hours.length === 1 ? `0${hours}` : hours;
  minutes = minutes.length === 1 ? `0${minutes}` : minutes;
  seconds = seconds.length === 1 ? `0${seconds}` : seconds;
  while (ms.length < 3) {
    ms = `0${ms}`;
  }

  return `${hours}:${minutes}:${seconds}.${ms}`;
}

export function formatFileSize(bytes, precision = 1) {
  if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
    return 'unknown size';
  } else if (bytes === 0) {
    return '0 bytes';
  }
  const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'],
    number = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, Math.floor(number))).toFixed(precision)} ${
    units[number]
  }`;
}

export default {
  formatTime,
};
