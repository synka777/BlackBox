# ⬛ Blackbox API

This project was developed as part of an L3 21-22 program in development at Estiam.

### What is it exactly?
In its current state, this project allows users to view and post text or HTML articles.

### What makes it innovative?
The innovation lies in the fact that articles posted by users are moderated by the users themselves. There is no administrator access, and article deletion is impossible.

### The goal behind this project
The aim of this project is to gain initial exposure to using new technologies to implement the concept of the permaweb in a project, ensure data protection, etc.  
The idea is to provide developers with a backend that enables them to post content with the guarantee that the information posted cannot ever be deleted. To be used wihen developing mobile apps.

____

## ⚠️ Prerequisites
Before starting, ensure you have the following prerequisites:
- Node.js installed in a stable or latest version
- Docker installed and running, with command-line access enabled
- The `.env` file must be located in the root of the backend directory

## 🚀 Quickstart
____

## 1 - Starting the API

To start using it, follow these three steps:

#### STEP 1: Environment preparation

Install the packages:
```
npm install
```

Prepare the container:
```
npm run setup
```
This command **downloads Docker and launches the BigchainDB container**, which will respond to storage requests made by the frontend (or Postman).  
If this command has already been executed, it will simply start the existing BigchainDB container on the machine.

#### STEP 2: Start the backend
Once the previous step is complete, start the project:

```
npm run start
```
Note: This command will fail if:
- The Docker container is not running
- The `.env` file is missing

#### STEP 3: Create sample data to use the project
For now, sample data must be imported manually. Import the request collection into Postman and use the endpoints for creating articles and other resources (currently, only articles are supported).

## ⚠ Notes
The data you create will not be lost as long as:
- You do not uninstall Docker from your machine
- You do not delete the Docker volumes attached to BigchainDB

⠀
__________________________
## 2 - Interacting with the API

### ⚠️ Prerequisite: Token generation for requests

Before interacting with the API, you need to generate a token by sending a username as a string in the request body.  
The response will provide a token, which is automatically stored in Postman's cookies.

Example:

```
token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkJyYXZlIFBsYXR5cHVzIiwiaWF0IjoxNjYwODI4ODU1LCJleHAiOjE2NjA4Mzc4NTV9.Q3g3dRbpEUSgu1WrfZhAHwx6eMQ0L2ea_pemb8FuVlc; Path=/; Expires=Thu, 18 Aug 2022 15:50:55 GMT;
```

To make requests without Postman via an HTTP client, manually add the token to the cookies.

| Endpoint  | localhost:9229/token/generate/  |
| ------------ | ------------ |
| Method  |  POST |

```
{
    "username":"Brave Platypus"
}
```
⠀
### 🔨 Creating Articles

Creating articles is simple using the following object format.  
Notes:
- A `date` field is automatically added when the article is written to the database.
- An `id` (tetherId) to link article data and metadata is also added.

This endpoint returns the newly created article as the response.

| Endpoint  | localhost:9229/article/create/ |
| ------------ | ------------ |
| Method  |  POST |

```
{
    "data": {
        "title" : "Foluptate velit esse cillum",
        "content" : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        "author" : "Brave Platypus"
    },
    "metadata" : {
        "category": "Training",
        "nsfw" : true
    }
}
```
⠀
### 🔍 Searching Articles

Articles can be searched:
- Without any parameters (= get all articles)
- By a case-sensitive keyword
- By article category
- By including or excluding NSFW results

If the search includes the `nsfw` flag set to true, the results will include:
- NSFW content (Not Safe For Work)
- Non-NSFW content

The purpose of the `nsfw` flag is to specify whether NSFW results should be included in the response.  
Setting this flag to true does not return only NSFW results.

| Endpoint  | localhost:9229/article/search/  |
| ------------ | ------------ |
| Method  |  POST |



```
{
    "keyword": "evolution",
    "nsfw": false,
    "category": "lifestyle"
}
```
⠀
### ⬆️ Updating Article Scores

To update a specific article, you need its `tetherId`.  
You can retrieve the `tetherId` by performing a search or getting it from the article creation response.

The actions indicate whether to upvote or downvote an article (similar to Reddit).  
Possible action keys are `upvote` and `downvote`, and these keys must have different values (boolean type).

This endpoint returns the updated metadata as the response.

| Endpoint  | localhost:9229/article/score/  |
| ------------ | ------------ |
| Method  |  POST |

```
{
    "tetherId":"jrbq8NH3i",
    "actions": {
        "upvote":true,
        "downvote":false
    }
}
```
⠀
### 🗳️ Voting to Modify Article Metadata

Since articles are managed collectively without administrators, superusers, or managers, only article score updates can be made by a single user.  
Other actions require a voting system to ensure that requested changes are legitimate and validated by the community.

Actions include:
- Changing an article's category if it was misclassified at creation
- Marking an article for deletion (via the `trash` flag)
- Flagging an article as sensitive content (via the `nsfw` flag)

Voting thresholds can be configured in the `.env` file, which must be located in the root of the backend project.

This endpoint returns the updated metadata as the response.

| Endpoint  | localhost:9229/vote/  |
| ------------ | ------------ |
| Method  |  POST |

```
{
    "tetherId":"jrbq8NH3i",
    "votes": {
        "category": "Innovation",
        "trash": false,
        "nsfw": false
    }
}
```
