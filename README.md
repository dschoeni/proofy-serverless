<img width="256" src="logo.png" align="right" />

# Veritas Node
Veritas - a truthserum for the internet. we snapshot websites, and proof their content at a specific point in time using cryptographic signatures from a network of validator nodes.

More information on [devpost](https://devpost.com/software/veritas-aspr4w/).

## Project setup
```
npm install
```

### To run worker local
Install CloudWorker & start with `-r` for watching.

```
npm install -g @dollarshaveclub/cloudworker
cloudworker -r --debug proof.js
```

### To deploy to the node workers
You first have to crete a serverless.yml according to [cloudflare]](https://serverless.com/framework/docs/providers/cloudflare/guide/intro/).

```
npm install -g serverless
serverless deploy
```

# How It Works

* Client sends URL of Website to a node
* Node gets Source of Website from supplied URL
* Node hashes the Source of Website
* Node signes Hash using their Private Key
* Node returns back Source, Hash & Signature to Client