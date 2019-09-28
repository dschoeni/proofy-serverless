

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const publicKey = {
  crv: 'P-256',
  ext: true,
  key_ops: ['verify'],
  kty: 'EC',
  x: 'DG-4eDIHkCdY1fM9al9y_UnPyXwRhVGaZ7ohAm74wRc',
  y: 'EY899N9XaXSejPMBAJ8YpmSmpvPvj0pX8K7D2k7OBn8'
}

function arrayBufferToBase64( buffer ) {
  var binary = '';
  var bytes = new Uint8Array( buffer );
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
      binary += String.fromCharCode( bytes[ i ] );
  }
  return btoa( binary );
}

async function handleRequest(request) {
  // usage example
  const uri = decodeURIComponent(request.url.substr(request.url.indexOf('url=') + 4))
  const url = new URL(uri)
  const hostname = url.protocol + '//' + url.hostname + '/';
  const response = await fetch(uri)
  const timestamp = new Date().getTime()

  var sourceCode = await response.text()
  var urls = [];
  matches = sourceCode.match(/<img [^>]*src="[^"]*"[^>]*>/gm);
  if(matches != null){
    urls = sourceCode.match(/<img [^>]*src="[^"]*"[^>]*>/gm).map(x => x.replace(/.*src="([^"]*)".*/, '$1'));
  }
  

  const blobs = await Promise.all(urls.map(async url => {
    if(!url.startsWith("http")){
      url = hostname + url
    }

    return new Promise(resolve => {
      setTimeout(() => resolve('timeout'), 8000)
      return fetch(url).catch(e => e)
    }).catch(_ => resolve('timeout'))
  }))
  const validResults = blobs.filter(result => result !== 'timeout');

  const base64Images = await Promise.all(validResults.map(async blob => {
    const buffer = await blob.arrayBuffer()
    return {
      url: url,
      base64: 'data:image/jpeg;base64,' + arrayBufferToBase64(buffer)
    }
  }))

  for (var i = 0; i < base64Images.length; i++) {
    sourceCode = sourceCode.replace(base64Images[i].url, base64Images[i].base64, 'g');
  }

  const hashOfSource = await crypto.subtle.digest('SHA-256', new TextEncoder('utf-8').encode(timestamp + sourceCode))
  const privateKey = await crypto.subtle.importKey(
    'jwk',
    {
      crv: 'P-256',
      d: '2EWbEWjNibDshp0WrrmOVl8hxLKONUbds0DIwnSIeqQ',
      ext: true,
      key_ops: ['sign'],
      kty: 'EC',
      x: 'DG-4eDIHkCdY1fM9al9y_UnPyXwRhVGaZ7ohAm74wRc',
      y: 'EY899N9XaXSejPMBAJ8YpmSmpvPvj0pX8K7D2k7OBn8'
    },
    {
      name: 'ECDSA',
      namedCurve: 'P-256'
    },
    false, // non-extractable
    ['sign']
  )

  // now sign the hash using our private key
  const signature = await crypto.subtle.sign(
    {
      name: 'ECDSA',
      hash: 'SHA-256'
    },
    privateKey, //from generateKey or importKey above
    hashOfSource //ArrayBuffer of data you want to sign
  )

  const headers = new Headers({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  })

  return new Response(
    JSON.stringify({
      hash: Array.from(new Uint8Array(hashOfSource)),
      signature: Array.from(new Uint8Array(signature)),
      signed: {
        timestamp: timestamp,
        source: sourceCode
      }
    }),
    { headers: headers }
  )
}
