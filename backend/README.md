```
npm install
npm run dev
```

```
npm run deploy
```

## serverless function involves running your cpde on several mini machines throughout the globe.
## the prolem arises when all these sereverless functions try to connect to database. so they are instead connected to a connection pool which makes a single connection to database.
## prisma does not support cli to interact with connection pool
## whenever a project is run enviorment variables are picked from wrangler.toml file.