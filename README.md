# Assignment Portal - Backend

node express api for the assignment portal

## how to run

```
npm install
node server.js
```

runs on port 5001

## setup

1. create mongodb atlas cluster (or use local mongo)
2. update connection string in server.js
3. hit localhost:5001/initdb to create test users

## test users
- teacher@test.com / 123
- student@test.com / 123

## api routes
- POST /login
- GET /initdb (creates dummy users)
- POST /assignment/create (teacher only)
- GET /assignment (returns all or published based on role)
- PUT /assignment/update (teacher, draft only)
- PUT /assignment/publish (teacher only)
- DELETE /assignment/delete/:id (teacher, draft only)
- POST /submission (student only, one per assignment)
- GET /submission/:assignmentId (teacher only)

## tech
- express
- mongoose
- jsonwebtoken
- cors
