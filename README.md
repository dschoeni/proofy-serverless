# To Test
Install CloudWorker & start with `-r` for watching.

```
npm install -g @dollarshaveclub/cloudworker
cloudworker -r --debug proof.js
```

# How It Works

* Client sends URL of Website
* Get Source of Website from supplied URL
* Hash Source of Website
* Sign Hash using our Proofy Private Key
* Send Back Source, Hash & Signature to Client
* Client uploads Hash & Signature as Payload in ETH Transaction to Proofy Public Address
* Client uploads source to IPFS, using TxId as Key 

# ToDo

* TX with Signature & Hash
* Client keeps: Source + Timestamp
* Präsi

=>

* Proof: Supply TxId
* Fetch Source from IPFS
* Signed Hash of Source proofs: This is the exact code that has been accessed at time of block from Proofy