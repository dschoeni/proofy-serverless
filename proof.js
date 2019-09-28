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

async function handleRequest(request) {
  // usage example
  const test = decodeURIComponent(request.url.substr(request.url.indexOf('url=') + 4))

  const response = await fetch(test)
  const timestamp = new Date().getTime()
  const sourceCode = await response.text()

  const hashOfSource = await crypto.subtle.digest('SHA-256', new TextEncoder('utf-8').encode(timestamp + sourceCode))

  /*
  const sha256Hash = Array.prototype.map
    .call(new Uint8Array(hashOfSource), x => ("00" + x.toString(16)).slice(-2))
    .join("");
  */

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

  const signatureString = Array.prototype.map.call(new Uint8Array(signature), x => ('00' + x.toString(16)).slice(-2)).join('')

  const headers = new Headers({
    'Content-Type': 'text/html',
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
