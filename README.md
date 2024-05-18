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

Steps:

1. Create key and certificates running in the command line (with OpenSSL installed):
   Openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days 3650
   Common name - SHould ideally be the domain name

2. Now we have the key and certificate

- The key means we are allowed to encrypt data from that cert
- The certificate allows who have the key to decrypt the data

3. Change my app.listen to:

```
  https
.createServer({
  key: fs.readFileSync("./key.pem"),
  cert: fs.readFileSync("./cert.pem"),
}, app).listen(.......)
```

- tbh, I am not sure about how it works for production environment
- As I googled, when working with a service such as Heroku, I don't have to mind about the SSL config

### Helmet.js

- RIght after the https requests are handled, the next step is secure our server from congiruation issues

- Helmet is a highly used NPM package that add security features, with just app.use(helmet())

  - npm install helmet

- Its a good practice to implement it in every project

### Authentication vs Authorization

- Authentication validates users are who the claim to be (email and password, biometrics, 2 factor auth, etc)

- Authorization (or access control) checks whether that an user has access to a specific resource after he is authenticated

- So, when we say about "auth", it usually englobes both

### Social Sign In

- Feature for signing in with social providers, such as Google, Github, Apple, Facebook etc

### API Keys

- There are 3 main methods to give authenticate an user:

  - API Keys
  - OAuth
  - JWT

- API Keys
  - Usually in params or in headers
  - Great for checks - Such as limit req frequency, identifying etc

### JWT

- ![Flow](./14.%20Security%20and%20Authentication/security-example/Notes%20Attachments/image.png)
- Encoded info, structured in:
  - Header
  - Payload
  - Signature

### OAuth Standard

- An authentication standard, which defines the data flow behind the scenes, and allow Social Sign In

### OAuth Flow

- 1st, we got:
  - Resource Owner => User
  - Client => Web Application Front End
  - Resource Server => Web Application Server
  - Authorization Server => Server that authenticates (such as google or github)

![OAuth flow](./14.%20Security%20and%20Authentication//security-example/Notes%20Attachments/OAuth.png)

### OAuth In Action with Single Sign On

- Lets see in practice (checking the dev tools to analyze reqs and res)

- Steps:
  - In medium, we clicked in login with Google btn;
    - A req was sent to medium api, to a route of sign in with google
  - So we were redirected to Google's domain (oauth2/auth endpoint)
    - To sign in and give permissions
  - We were redirected to Medium's api/callback/authenticate
    - In the params, Medium gets the toen the needs to complete the flow
