# National Open Data Elections Project Website

## Introduction

Welcome to the NODE Project - a place to find information about your elected officials and
when/where they meet. This project was started at Oregon State University but depends upon
crowd sources from throughout the United States to help add and maintain the data so that
they are as accurate as possible. NODE stands for National Open Database for Elections.
All of the data you will find on this site is open data and available for developers to
build upon with their own tools. The data is available under the terms of the MIT License.

## Installation Instructions

### To run the app locally

1. Make sure you have `node` and `npm` installed. 
    
2. Alternatively, use [yarn](https://yarnpkg.com/en/) for faster dependency installation
    and more stable dependency management. You can use `yarn` in the place of `npm`.
    
3. Clone the repository.
    - Using SSH (recommended):
    ```
    $ git clone git@github.com:kalcicd/node_project.git
    ```
    - Using HTTPS:
    ```
    $ git clone https://github.com/kalcicd/node_project.git
    ```
    
4. Move into the cloned directory.
    ```
    $ cd node_project
    ```

5. Install dependencies.
    ```
    $ npm/yarn install
    ```
 
6. Copy the config example to `./config/default.json` and fill in the
   placeholder data values in the newly copied file.
   ```
   $ cp ./config/default-example.json ./config/default.json
   ```
    
7. Run the app locally in a _development_ mode.
    ```
    $ npm/yarn run dev
    ```
    - The development mode comes with a "watch" functionality. Changes made either
    to the client side and the server side are immediately detected and the app is
    re-bundled / re-started automatically.
    
8. Run the app locally in a _production_ mode.
    ```
    $ npm/yarn start
    ```
    - The production mode bundles the app into a much smaller size.
    
9. Visit `http://localhost:8080/`: to navigate to the landing page.


### To run the app in Docker

This project comes **Docker ready** out of the box. [Docker](https://www.docker.com/)
is a software container platform. A Docker image contains information on everything
required to make an app run. This self-contained system makes it extremely easy to
ensure that your app runs on any OS without worrying about the dependency compatibility.

Regardless of where it’s deployed, _your app will always run the same_ as long as
Docker is installed on the machine.

1. Install Docker: https://docs.docker.com/engine/installation/
   - Docker Compose is required for this application, but most installations of Docker
     come bundled with this tool. For some machines, you may have to install Docker-compose
     separately. Look [here](https://docs.docker.com/compose/install/) for details

2. Clone the repo and move into the directory (see above)

3. Copy the config example to `./config/default.json` and fill in the
   placeholder data values in the newly copied file.
   ```
   $ cp ./config/default-example.json ./config/default.json
   ```

4. Run the shell script to run the app in Docker.
    ```
    $ ./run-app-in-docker.sh
    ```
    
5. Yep, that's it. Visit `http://localhost:8080/` to checkout the app.
