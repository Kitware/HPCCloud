import expect from 'expect';
import {formatFileSize, formatTime} from '../../src/utils/Format';

describe('formatTime', () => {
  it('formats time to hh:mm:ss.ms', () => {
    // 15:32:00.000, the formatter takes unix seconds
    const date = new Date(1474061520000);
    const time = date.valueOf() / 1000;
    const hours = date.getHours().toString().length === 1 ? `0${date.getHours()}` : date.getHours();
    // safe to test in whole numbered timezones (e.g. not Newfoundland or Nepal)
    expect(formatTime(time))
      .toEqual(`${hours}:32:00.000`);

    expect(formatTime(time + 1))
      .toEqual(`${hours}:32:01.000`);

    expect(formatTime(time + 0.001))
      .toEqual(`${hours}:32:00.001`);
  });
});

describe('formatFileSize', () => {
  it('catches wrong file sizes', () => {
    expect(formatFileSize(0))
      .toEqual('0 bytes');

    expect(formatFileSize(Infinity))
      .toEqual('unknown size');

    expect(formatFileSize(NaN))
      .toEqual('unknown size');
  });

  it('formats bytes', () => {
    expect(formatFileSize(1))
      .toEqual('1.0 bytes');

    expect(formatFileSize(1000))
      .toEqual('1000.0 bytes');

    expect(formatFileSize(1024 + 512))
      .toEqual('1.5 KB');

    const MB = 1024 * 1024;
    expect(formatFileSize(MB))
      .toEqual('1.0 MB');

    const GB = 1024 * 1024 * 1024;
    expect(formatFileSize(GB))
      .toEqual('1.0 GB');
  });

  it('formats with precision', () => {
    expect(formatFileSize(1024 + 512, 2))
      .toEqual('1.50 KB');
  });
});
