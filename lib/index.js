'use strict';

/**
 * Module dependencies
 */

/* eslint-disable no-unused-vars */
// Public node modules.
const _ = require('lodash');
const AWS = require('aws-sdk');
AWS.config.update({region: 'ap-south-1'});

module.exports = {
  init(config) {
    const S3 = new AWS.S3({
      apiVersion: '2006-03-01',
      ...config,
    });

    return {
      upload(file, customParams = {}) {
        return new Promise((resolve, reject) => {
          // upload file on S3 bucket
          if(!(file.mime.includes('image') && file.mime != 'application/pdf')){
            reject("Filetype not supported");
            return;
          }
          let path = 'uploads/';
          path = path + (file.path ? `${file.path}/` : '');
          path = path + (file.private ? 'private/' : 'public/')
          console.log(path);
          S3.upload(
            {
              Key: `${path}${file.hash}${file.ext}`,
              Body: Buffer.from(file.buffer, 'binary'),
              ACL: file.private ? 'private' : 'public-read',
              ContentType: file.mime,
              ...customParams,
            },
            (err, data) => {
              if (err) {
		console.log(err);
                return reject(err);
              }

              // set the bucket file url
              file.url = data.Location;

              resolve();
            }
          );
        });
      },
      delete(file, customParams = {}) {
        return new Promise((resolve, reject) => {
          // delete file on S3 bucket
          const path = file.path ? `${file.path}/` : '';
          S3.deleteObject(
            {
              Key: `${path}${file.hash}${file.ext}`,
              ...customParams,
            },
            (err, data) => {
              if (err) {
                return reject(err);
              }

              resolve();
            }
          );
        });
      },
    };
  },
};
