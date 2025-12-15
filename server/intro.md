1) Download depenedcies in package.json
2) npm init -y
3) create a server.js and app.js
4) in server.js define only .env
5) in app.js define express,cors
6) install clerk
7) Database definition:
create a prisma folder with schema.prisma
follow docs
add some commands in package.json
define prisma.configs in configs 
npx prisma db push (run this command to create db in neon)]
8) Create a webhook for clerk and configure with ingest 
1) create webhook and take the key and past into .env
2) get ingest event key and signing key
3) go to ingest docs with node.js and install ingest 