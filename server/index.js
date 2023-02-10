import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { WritableStream } from "node:stream/web";

const PORT = 3000
createServer(async (request, response) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
  };

  if (request.method === "OPTIONS") {
    response.writeHead(204, headers);
    response.end();
    return;
  }

  let items = 0;
  Readable.toWeb(createReadStream("./cities.csv"))
  .pipeTo(new WritableStream({
    write(chunk) {
      items++
      response.write(chunk);
    },
    close() {
      response.end();
    }
  }));

  response.writeHead(200, headers);
  // response.end("ok");
})
.listen(PORT)
.on("listening", _=> console.log(`Server is running at ${PORT}`));