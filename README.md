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

5.  Set Cookies and Session (see next topics)

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

### Server VS Client Side Sessions With Cookies

- How do we store session data?

  - Server side sessions => database
  - Client-Side Sessions => In the browsers cookies

- So we could use Stateful Cookies or Stateless Cookies

  - Stateful Cookies - Are the ones stored in the server / DB, which has its own costs, as may compromise scalability, as it will overload the server, making it Read and Write constantly from the Database
  - Stateless Cookies - Stored in the Browser's cookies - The server can still trust in the data, _as long as the server signs - wit the secret - or encrypts the user's cookies before they are sent_

- When we are REALLY concerned to the data, it's good to use server side session, but in the majority of cases, Client-Side Sessions are enough
  - Such as user logged in info, Client-Side session are less expensive and enough

### Implementing Session Middleware (How to remember the user logged in our app)

- To that, we use Sessions
  - As we use Express, there are 2 main package options to use: express-session and cookie-express
- Lets analyze both:

- Express-session

  - It's used to save cookie in the server side
  - It uses Cookies, but only to refer to sessoin Ids
  - Session data lives in the database
    - The express-session middleware uses in memory storage, which will get erased when the server is restarted

- Cookie-session

  - Stores the actual sessoin data inside the user's cookie
  - It's simpler - does not require a database
  - The cookie data needs to be small (browser limits the size of a cookie)

- We are going to cookie-session, as it:

  - simplifies scaling
  - Can have multiple instances of our node server running
  - don't need a database to accomplish
  - The server can remain stateless
  - Is enough in the majority of use cases

- Actually cookie-session had an error, and we used express-session to make it work

### Implementing Auth Check with Cookies

- Steps:

  1. Config express-session

  - npm install express-session
  - Config the session / cookie right before passport.initialize()

  2. Wrap Up Cookie with Passport

  - Set up serializeUser() and deserializeUser() methods (before the app runs)
  - In the google/callback options - set sessoin to true (default)
  - Add passport session MW right after the initialization
    ```
    app.use(passport.initialize());
    app.use(passport.session()); // Configs the sessions: Authentications the session, config the serializeUser and deserializeUser logic etc
    ```
    Now we can see we got a cookie when logged in

  3. Define the scope of my cookie => Updating mu serializeUser() and deserializeUser() logic

  4. Create Restricing Middleware

  - In our case, it's the secret route to be protected
  -

- Notes

  1. express-session configuration

  - The secret keys are the 'signatures' of the cookie being created by the server
  - We can use an array of keys, for when we want to update the key but not to unable the current used kes

  2. About Passport cookie implementation

  - Passport has 2 funcions to work with cookies:
    - passport.serialize() => serialize the user data to the cookie
    - passport.deserialize()
      - deserialize, or take the data from the cookie, and places it into the request object (req.user)
