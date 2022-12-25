import fetch from 'node-fetch';
import fs from 'fs';

export const handler = async (event) => {
  const bitrate = event.queryStringParameters.bitrate;

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
    const response = await fetch(source);
    const json = await response.json();

    const webradios = json.webradios;
    const m3u = [];
    const header = `#EXTM3U\r\n#${new Date()}\r\n`;
    let d = '';
    let i;
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

    return m3uFile;
    // try {
    //   //const path = '../../../../../../output/json/playlist.json';
    //   const response = await fetch(source);
    //   const json = await response.json();
    //   const webradios = json.webradios;
    //   const m3u = [];
    //   const header = `#EXTM3U\r\n#${new Date()}\r\n`;
    //   let d = '';
    //   let i;
    //   const fallbackBitrate = bitrate ? bitrate : '64';
    //   for (const webradio of webradios) {
    //     d +=
    //       '#EXTINF:-1,' +
    //       webradio.name +
    //       '\r\n' +
    //       webradio[quality[fallbackBitrate]] +
    //       '\r\n';
    //     m3u.push(webradio);
    //   }
    //   //   for (i = 0; i < webradios.length; i++) {
    //   //     d +=
    //   //       '#EXTINF:-1,' +
    //   //       webradios[i].name +
    //   //       '\r\n' +
    //   //       webradios[i][quality[fallbackBitrate]] +
    //   //       '\r\n';
    //   //     m3u.push(webradios[i]);
    //   //   }
    //   m3uFile = header + d;
    //   return m3uFile;
    //   //   console.log('m3uFile: ', m3uFile);
    //   //const file = fs.createWriteStream(path);
    //   //response.pipe(file);
    //   //   response.on('end', () => {
    //   //     console.log('json correctly downloaded');
    //   //     //resolve();
    //   //   });
    // } catch (error) {}
    // // return new Promise((resolve, reject) => {
    // //   const path = __dirname + '/json/playlist.json';
    // //   fetch(source, (response) => {
    // //     console.log('source= ', response);
    // //     const file = fs.createWriteStream(path);
    // //     // output file in json format
    // //     response.pipe(file);
    // //     response.on('end', () => {
    // //       console.log('json correctly downloaded');
    // //       resolve();
    // //     });
    // //   });
    // // });
  };

  function generateM3u(bitrate) {
    return new Promise((resolve, reject) => {
      const path = '../output/json/playlist.json';
      fs.readFile(path, 'utf-8', (err, data) => {
        if (err) console.error(err);
        const content = JSON.parse(data);
        const jsonContent = content.webradios;
        const m3u = [];
        const header = `#EXTM3U\r\n#${new Date()}\r\n`;
        let d = '';
        let i;
        const fallbackBitrate = !!bitrate ? '64' : bitrate;

        for (i = 0; i < jsonContent.length; i++) {
          d +=
            '#EXTINF:-1,' +
            jsonContent[i].name +
            '\r\n' +
            jsonContent[i][quality[fallbackBitrate]] +
            '\r\n';

          m3u.push(jsonContent[i]);
        }

        m3uFile = header + d;
        console.log('M3U content correctly generated');
        resolve();
      });
    });
  }

  function writeFile() {
    return new Promise((resolve, reject) => {
      fs.writeFile(`../output/m3u/playlist.m3u`, m3uFile, (err) => {
        if (err) return console.error('error writing file', err);
        console.log(`File created in ${__dirname}/m3u/playlist.m3u`);
        resolve();
      });
    });
  }
  // application/x-mpegurl
  async function getFile(bitrate) {
    await getPlaylist(bitrate);
    //await generateM3u(bitrate);
    //await writeFile();
  }
  const file = await getPlaylist(bitrate);
  console.log('file: ', file);
  const buffer = Buffer.toString(file);
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/x-mpegurl',
      'Content-Disposition': 'attachment; filename=test.m3u'
      //   'Content-length': buffer.length
    },
    body: buffer
  };
};
