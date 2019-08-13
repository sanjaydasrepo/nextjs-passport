require("dotenv").config();
import express from "express";
import http from "http";
import next from "next";
import thoughtsAPI from "./thoughts-api";

const dev = process.env.NODE_ENV !== "production";

const app = next({
    dev,
    dir: "./src"
  });

const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();
  
    server.use(thoughtsAPI);
  
    // handling everything else with Next.js
    server.get("*", handle);
  
    http.createServer(server).listen(process.env.PORT, () => {
      console.log(`listening on port ${process.env.PORT}`);
    });
});

