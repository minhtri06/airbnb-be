# Airbnb Clone BE

## About this project

This is the backend of my Airbnb clone application. Which implements the basic feature of airbnb.com such as search/reserve property, post a property, find property in map, message host, etc.

[FE repository](https://github.com/minhtri06/airbnb-fe)

## Test

You can visit the live website in [here](https://minhtri06-airbnb.vercel.app/)

Or test its api in postman:

[![Test in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/24479002-a0d0018d-0ca4-4676-ba1f-b972bb391043?action=collection%2Ffork&collection-url=entityId%3D24479002-a0d0018d-0ca4-4676-ba1f-b972bb391043%26entityType%3Dcollection%26workspaceId%3D0b819cc4-d8fd-4e66-87e0-42eb692c58f2#?env%5BNew%20Environment%5D=W10=)

## Features

-   Sign up, verify email
-   Login with email/password, google login
-   Check auth with jwt token, refresh token, blacklist suspicious tokens
-   Update profile
-   Reset password
-   Post a property
-   Book property
-   Update property
-   Manage property's booking
-   Search properties by location and booking date
-   Check property availability
-   Save/un-save property
-   Review a property
-   Message with host
-   Schedule jobs

## Technologies

-   ExpressJs
-   Mongodb, Redis (cache)
-   Cloudinary
-   Socket.io
