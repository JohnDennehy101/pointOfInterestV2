# Enterprise Web Development Module - Point of Interest Web Application (Version 2)

#### Student Name: John Dennehy Student ID: 20091408

## Introduction

“A “point of interest” (POI) is a location for which information is available. A POI can be as simple as a set of coordinates, a name, and a unique identifier, or more complex such as a three-dimensional model of a building with names in multiple languages, information about opening and closing hours, and a civic
address. POI data has many applications, including augmented reality browsers, location- based social networking games, geocaching,
mapping and navigation systems.”

I chose to focus on Irish national monuments for this assignment.

## API

For this assignment, the Hapi framework was used to develop a backend API for CRUD operations around user and point of interest management. Another significant focus of this assignment was unit testing with Mocha. NYC (also know as istanbul) tool used to generate code coverage reports. API routes are secured using Json Web Tokens (JWT).

## Code Coverage

![Code Coverage Overview](https://github.com/JohnDennehy101/pointOfInterestV2/blob/main/public/images/codeCoverage.png)

## Technology Stack - BackEnd API

- hapi
- mongodb
- Cloudinary
- OpenWeather API
- Joi
- sanitizeHtml
- JWT

## AWS Deployment

Here's a link to a live version of the application on AWS: [API Application Link](https://point-of-interest-v1.herokuapp.com/)
