export function formatTime(time) {
  var date = new Date(time),
    hours = date.getHours().toString(),
    minutes = date.getMinutes().toString(),
    seconds = date.getSeconds().toString(),
    ms = date.getMilliseconds().toString();

  hours = hours.length === 1 ? `0${hours}` : hours;
  minutes = minutes.length === 1 ? `0${minutes}` : minutes;
  seconds = seconds.length === 1 ? `0${seconds}` : seconds;
  if (ms.length < 3) {
    while (ms.length < 3) {
      ms = `0${ms}`;
    }
  }

  return `${hours}:${minutes}:${seconds}.${ms}`;
}


export default {
  formatTime,
};
