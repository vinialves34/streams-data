import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { Readable, Transform } from "node:stream";
import { WritableStream } from "node:stream/web";
import { setTimeout } from "node:timers/promises";

import csvtojson from "csvtojson";

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

  request.once("close", _=> console.log(`connection was closed`, items));

  let items = 0;
  Readable.toWeb(createReadStream("./mocks/users.csv"))
  .pipeThrough(Transform.toWeb(csvtojson()))
  .pipeThrough(new TransformStream({
    transform(chunk, controller) {
      const {
        first_name,
        last_name,
        email,
        avatar
      } = JSON.parse(Buffer.from(chunk));
      const mappedData = {
        fullname: `${first_name} ${last_name}`,
        email,
        avatar
      };

      controller.enqueue(JSON.stringify(mappedData).concat("\n"));
    }
  }))
  .pipeTo(new WritableStream({
    async write(chunk) {
      await setTimeout(200)
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
