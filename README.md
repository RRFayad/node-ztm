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

### Implementing Google OAuth in our application

- Setup Application in Google
  - Create OAuth Client ID
  - Attention to the URIs

### Authentication Endpoints With Middleware

- When checking auth, we should use a middleware before the restricted endpoints

- Also, we planned our routes first (google sign in, google callback and logout (which is not Google specific))

### Passport.js

- Passport helps us to implement OAuth with different strategies (plug ins for different companies)

### Steps:

1.  Setup Application in Social Networks (Google, Github etc)

    - Get the keys in a .env file

2.  Structure Endpoints and Auth Middlwares

3.  Passport Config

    - Install passport and the passport stragtegies
    - Require passport and the Strategy
    - Create the passport configutarion MW (which may need a verifyCallback), in the beginning (we did it even before creating the express app):

      ```
        const verifyCallback = (accessToken, refreshToken, profile, done) => {
            console.log({ accessToken, refreshToken, profile });
            done(null, profile);
            };

        passport.use(
        new Strategy(
        {
        callbackURL: process.env.GOOGLE_OAUTH_CALLBACK_URI,
        clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
        clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        },
        verifyCallback
        )
      );
      ```

    - Add passport initialize MW, as one of the firsts steps after te app is created:

      ```
      app.use(passport.initialize());
      ```

4.  Implementing the Auth routes and controllers

    - Add the google (or other network) callback endpoint logic

          ```
          app.get("/auth/google", passport.authenticate("google", { scope: ["email"] }));

          app.get(
          "/auth/google/callback",
          passport.authenticate("google", {
            failureRedirect: "/failure",
            successRedirect: "/",
            session: false, // We will keep it as false just for now
          }),
          (req, res, next) => {
            console.log("Google called us back!! Yaay");
          }
          ); // The specified redirect in our google configuration
          ```

### Cookies Based Auhentication

    - Cookies are basically string data stored in the browser
      - They can be seen in Dev tools -> application -> Cookies

    ![Cookies Auth](14.%20Security%20and%20Authentication/security-example/Notes%20Attachments/cookies-auth.png)

    - We can use Cookie-Based Auth instead of Token-Based Auth:
      - Remembering about tokens: Browser send auth info to the server => Server validates and gives a token back => Browser send info with Bearer token in the Header=> server validate the token and res.status 200
      - IN Cookie-Based: Browser sends auth info to Server => Server Set-Cookie:sessoin (instead of giving a token) => Now the Browser sedn reqs with the Header Cookie:session=... => Server find and deserialize session and res.status 200

    - So, we need to understand what Session means

### Sessions

- Sessoins are a way of storing data about the current user

  - Public data could be stores in the client-side
  - In session we store data we don't want users to be able to modify

- Sessions are usually short-lived, usually relevant states (like items of a shopping cart)
  - While more persistent data (such as orders history) in the Database
