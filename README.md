
<h1 align="center">
  <br>
  TinyApp Project
  <br>
</h1>

<h4 align="center">TinyApp is a full stack web application built with <a href="https://nodejs.org/en/">Node.js</a> and <a href="https://expressjs.com/">Express.js</a> that allows users to shorten long URLs (à la bit.ly).</h4>

<p align="center">
  <a href="#final-product">Final Product</a> •
  <a href="#dependencies">Dependencies</a> •
  <a href="#getting-started">Getting Started</a>
</p>



## Final Product

!["Screenshot of URLs page - Not Login"](https://github.com/tienviet10/tinyapp/blob/main/docs/urls-no-login.png?raw=true)
!["Screenshot of URLs page"](https://github.com/tienviet10/tinyapp/blob/main/docs/urls.png?raw=true)
!["Screenshot of Editting page"](https://github.com/tienviet10/tinyapp/blob/main/docs/edit-short-url.png?raw=true)
!["Screenshot of Login page"](https://github.com/tienviet10/tinyapp/blob/main/docs/login.png?raw=true)
!["Screenshot of Registration page"](https://github.com/tienviet10/tinyapp/blob/main/docs/register-account.png?raw=true)


## Dependencies

**Dependencies**

- [Node.js](https://nodejs.org/en/)
- [Express](https://expressjs.com/)
- [EJS](https://ejs.co/)
- [bcryptjs](https://github.com/kelektiv/node.bcrypt.js#readme)
- [cookie-session](https://github.com/expressjs/cookie-session#readme)

**Dev-dependencies**
- [Chai](https://www.chaijs.com/)
- [Mocha](https://mochajs.org/)
- [Nodemon](https://nodemon.io/)

## Getting Started

### OPTION 1: (Git and Node are required)

**Prerequisites**

The following applications should be installed in your system:
* [Git](https://git-scm.com) 
* [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com))


**Server**

1. Create a folder and clone this repository

```sh
$ git clone https://github.com/tienviet10/tinyapp.git
```

2. Move to the correct directory

```sh
$ cd tinyapp
```

3. Install dependencies

```sh
$ npm install
```
4. Create a .env file according to the .env.sample file. Fill out the PORT, password (for the default user: user@example.com), and the secret keys for cookie session. For instance: 

```sh
PORT = 8080
PASSWORD1 = Hello123
SESSIONKEY1 = Hello, this is my secret key
SESSIONKEY2 = If you can guess my secret key, you are amazing
```

5. Run the development web server

```sh
$ node express_server.js
```

### OPTION 2: (Git and Docker are required)

**Prerequisites**

The following applications should be installed in your system:
* [Git](https://git-scm.com) 
* [Docker](https://docs.docker.com/get-docker/)

**Development using Bind Mount**

1. Create a folder and clone this repository

```sh
$ git clone https://github.com/tienviet10/tinyapp.git
```

2. Move to the correct directory

```sh
$ cd tinyapp
```

4. Create a .env file according to the .env.sample file. Fill out the PORT, password (for the default user: user@example.com), and the secret keys for cookie session. For instance: 

```sh
PORT = 8080
PASSWORD1 = Hello123
SESSIONKEY1 = Hello, this is my secret key
SESSIONKEY2 = If you can guess my secret key, you are amazing
```

5. Build an image

```sh
$ docker build -t tinyapp .
```

6. Run the app with the following command

```sh
$ docker run --rm -p 8080:8080 --env-file ./.env --name tiny-app-1 -v $(pwd):/app:ro -v /app/node_modules tinyapp
```

### OPTION 3: (Docker is required)

**Prerequisites**

The following applications should be installed in your system:
* [Docker](https://docs.docker.com/get-docker/)

**Downloading Docker Image from Docker Hub**

```sh
$ docker run -d --rm -p 80:8080 --env PORT=8080 --env PASSWORD1=Hello --env SESSIONKEY1=Hello --env SESSIONKEY2=Hi tienviet/tiny-app
```

