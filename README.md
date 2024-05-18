# Complete NodeJS - ZTM

https://zerotomastery.io/cheatsheets/

## Intro & Fundamentals Review

- Node, as it's a runtime, has its own API

  - So Node brings global object (analog to what window in the browser is)

## Security + Authentication

- [repo link](https://github.com/odziem/security-example)

### Overview

- Google OAuth, Social Sign in

- In real world, we never implement authenticatoin from scratch, we implement it from well-proven approaches (such as OAuth)
  - So, some standards are used, such as Auth0, Amazon Cognito, Social Sign On

### Encrypted Connections with SSL and TLS

- 1st, we need to be sure we are using HTTPS (encrypted http req and res)

- When we are not using HTTPS, anyone in the same wi-fi network can read the traffic with a pack analysis tool (Such as WireShark)

- HTTPS protocols uses the encryption of SSL and TLS (TLS is the successor of SSL)

- There are specific well trust certificates, to ensure a web page is secure

### Setting up our server (Secutiry-Example folder)

-
