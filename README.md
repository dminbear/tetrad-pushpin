# Tetrad Custom Push-Pin Manipulation Tool


## Summary
Our project is to build a module where users can upload their custom images to create push-pin images which can be used to be displayed on Google Map. 


## How to run
Backend and frontend has been decoupled, and they are developed completely separate from one another. They are stored in the backend directory and the frontend directory. README.md is included in each directory which directs how to run them for development purpose. 


## Architecture
1. Back-end
    * Node.js: REST API provider. user verification. interaction with Amazon S3
        * Express.js: web framework for building the REST API
        * AWS SDK: file upload/download redirect to S3 bucket
    * MongoDB: stores image related data specific for each user
    * NGINX: web server
    * Docker: for a stream-lined development process. prevents development environment divergence
    * Mocha: RESTful api testing framework

2. Front-end
    * React.js: single page application library
    * Fabric.js: Javascript image editing library 
    * Webpack: module bundler for creating static assets
    * Jest: testing framework
