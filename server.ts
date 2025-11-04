import { createRequestHandler } from '@remix-run/express';
import express from 'express';

// notice that the result of `remix vite:build` is "just a module"
import * as build from './build/server/index.js';
import fs from 'node:fs';
import https from 'node:https';

const app = express();
app.use(express.static('build/client'));

const key = fs.readFileSync('./ssl/key.pem');
const cert = fs.readFileSync('./ssl/cert.pem');

// and your app is "just a request handler"
//@ts-ignore
app.all('*', createRequestHandler({ build }));

const server = https.createServer({ key, cert }, app);

const port = process.env.PORT || 3000;

server.listen(port, () => {
	console.log(`Server started on https://localhost:${port}`);
});
