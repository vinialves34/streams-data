const API_URL = "http://localhost:3000";
let counter = 0;

async function consumeAPI(signal) {
  const response = await fetch(API_URL, {
    signal
  });

  const reader = response.body
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(parseNDJSON())
    // .pipeTo(new WritableStream({
    //   write(chunk) {
    //     console.log(++counter, "chunk", chunk);
    //   }
    // }));

  return reader;
}

function appendToHTML(element) {
  return new WritableStream({
    write({ fullname, email, avatar }) {
      const card = `
        <article>
          <div class="text">
            <p>[${++counter}]</p>
            <div class="header-card">
              <img src="${avatar}" alt="avatar-${fullname}">
              <h3>${fullname}</h3>
            </div>
            <p>Email: ${email}</p>
          </div>
        </article>
      `;
      element.innerHTML += card
    },
    abort(reason) {
      console.log("aborted", reason);
    }
  })
}

function parseNDJSON() {
  let ndjsonbuffer = "";
  return new TransformStream({
    transform(chunk, controller) {
      ndjsonbuffer += chunk;

      const items = ndjsonbuffer.split("\n");

      items.slice(0, -1)
        .forEach(item => controller.enqueue(JSON.parse(item)));

      ndjsonbuffer = items[items.length -1];
    },
    flush(controller) {
      if (!ndjsonbuffer) return;
      controller.enqueue(JSON.parse(ndjsonbuffer));
    }
  })
}

const [ 
  start,
  stop,
  cards
] = [ "start", "stop", "cards"].map(item => document.getElementById(item))

let abortController = new AbortController();
start.addEventListener("click", async () => {
  const readable = await consumeAPI(abortController.signal);
  readable.pipeTo(appendToHTML(cards));
});

stop.addEventListener("click", () => {
  abortController.abort();
  console.log("aborting...");
  abortController = new AbortController();
});