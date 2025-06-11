import { readFileSync, writeFileSync } from "fs";
import { decode } from 'jpeg-js';

import { load, TagValues, dump, ValueConvertError, remove, insert, getExifFromHeif } from '../../src/index';
import { expect, test, it } from 'vitest';

test('"load" returns a object contains IFD -- 1', () => {
  const jpegBinary = readFileSync("./tests/files/r_canon.jpg").toString("binary");
  const exifObj = load(jpegBinary);
  expect(Object.keys(exifObj)).toContain('0th');
});
 

test('"dump" returns correct value" -- 1', () => {
  const exifObj = {
    '0th': {
      [TagValues.ImageIFD.ImageWidth]: 10,
      [TagValues.ImageIFD.ImageLength]: 10
    }
  };
  const exifBinary = dump(exifObj);
  const correctBinary = 'Exif\x00\x00MM\x00*\x00\x00\x00\x08\x00\x02\x01\x00\x00\x04\x00\x00\x00\x01\x00\x00\x00\n\x01\x01\x00\x04\x00\x00\x00\x01\x00\x00\x00\n\x00\x00\x00\x00';
  expect(exifBinary).toBe(correctBinary);
});

test('"dump" throws "ValueConvertError"" -- 1', () => {
  const exifObj = {
    '0th': {
      [TagValues.ImageIFD.ImageWidth]: "10"
    }
  };
  expect(
    () => { dump(exifObj); }
  ).toThrow(ValueConvertError);
});

test('Compare "load" output with some correct values - BIG ENDIAN FILE - 1', () => {
  const jpegBinary = readFileSync("./tests/files/r_canon.jpg").toString("binary");
  const exifObj = load(jpegBinary);
  expect(exifObj['0th'][TagValues.ImageIFD.Make]).toBe('Canon');
  expect(exifObj['0th'][TagValues.ImageIFD.Orientation]).toBe(1);
  expect(exifObj['Exif'][TagValues.ExifIFD.ExposureTime]).toEqual([1, 50]);
  expect(exifObj['Exif'][TagValues.ExifIFD.PixelXDimension]).toBe(4352);
});

test('Compare "load" output with soem correct values - LITTLE ENDIAN FILE - 1', () => {
  const jpegBinary = readFileSync("./tests/files/r_sony.jpg").toString("binary");
  const exifObj = load(jpegBinary);
  expect(exifObj['0th'][TagValues.ImageIFD.Make]).toBe('SONY');
  expect(exifObj['0th'][TagValues.ImageIFD.Orientation]).toBe(1);
  expect(exifObj['Exif'][TagValues.ExifIFD.ExposureTime]).toEqual([1, 125]);
  expect(exifObj['1st'][TagValues.ImageIFD.JPEGInterchangeFormatLength]).toBe(13127);
});

 

test('success remove -- 1', () => {
  const jpegBinary = readFileSync("./tests/files/r_pana.jpg").toString("binary");
  const exifObj = load(jpegBinary);
  expect(Object.keys(exifObj)).toContain('0th');
  const jpegBinaryRemovedExif = remove(jpegBinary);
  const exifObjRemovedExif = load(jpegBinaryRemovedExif);
  expect(exifObjRemovedExif).toEqual({});
});

test('success insert -- 1', () => {
  const jpegBinary = readFileSync("./tests/files/noexif.jpg").toString("binary");
  const exifBinary = 'Exif\x00\x00MM\x00*\x00\x00\x00\x08\x00\x02\x01\x00\x00\x04\x00\x00\x00\x01\x00\x00\x00\n\x01\x01\x00\x04\x00\x00\x00\x01\x00\x00\x00\n\x00\x00\x00\x00';
  const jpegBinaryExifInsert = insert(exifBinary, jpegBinary);
  const buffer = Buffer.from(jpegBinaryExifInsert, 'ascii');
  decode(buffer, true);
  expect(jpegBinaryExifInsert).toMatch(exifBinary);
});

it('should can load from heif', async () => {
  const heifBinary = readFileSync("./tests/files/image4.heic").toString("binary");
   
 
  const nodeOutput = load(heifBinary);
  expect(nodeOutput).toMatchInlineSnapshot(`{}`);
});