'use strict';
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const fetch = require('node-fetch');

const router = express.Router();
router.get('/', async (req, res) => {
  const bitrate = req?.query?.bitrate;
console.log('bitrate: ', req?.query?.bitrate)
  const source =
    'http://players.nrjaudio.fm/wr_api/live/fr?act=get_mobile_setup&cp=utf8&fmt=json&id_sysos=2&ver=2&id_radio=1';
  const url_64k_aac = 'url_64k_aac';
  const url_128k_mp3 = 'url_128k_mp3';
  let m3uFile;

  const quality = {
    64: url_64k_aac,
    128: url_128k_mp3
  };

  const getPlaylist = async (bitrate) => {
    try {
      console.log('init fetch')
      const response = await fetch(source);
      const json = await response.json();
      console.log('json: ', json)

      const webradios = json.webradios;
      const m3u = [];
      const header = `#EXTM3U\r\n#${new Date()}\r\n`;
      let d = '';
      const fallbackBitrate = bitrate ? bitrate : '64';

      for (const webradio of webradios) {
        console.log('webradio: ', webradio);
        d +=
          '#EXTINF:-1,' +
          webradio.name +
          '\r\n' +
          webradio[quality[fallbackBitrate]] +
          '\r\n';

        m3u.push(webradio);
      }

      m3uFile = header + d;
      console.log('m3uFile: ', m3uFile)
      return m3uFile;
    } catch (error) {
      console.log('error from nrj get: ', error?.response);
    }
  };
  
  const file = await getPlaylist(bitrate);
  
  res.writeHead(200, {
    'Content-Type': 'application/x-mpegurl',
    'Content-Disposition': `attachment; filename=playlist_${new Date().toLocaleDateString()}.m3u`
  });

  res.end(file);
});

app.use('/.netlify/functions/get', router); // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);
