# mediasoup-easy-one-to-many-consumer-js

Video consumer of an easy to use one-to-many broadcasting tool based on mediasoup.

## Installation

```sh
npm install mediasoup-easy-one-to-many-consumer-js
```

## Getting started

Call `useConsume` to setup a consumer using your options. `useConsume` will return functions that let you  establish the connection to the mediasoup router (`connect`) and start consuming the stream (`subscribe`).

```ts
import { useConsume } from "mediasoup-easy-one-to-many-consumer-react";

const { connect, subscribe } = useConsume({
    url: "https://example.com:3014",
    remoteVideoElId: "remote-stream"
});

// ...
connect() // initialize the connection to the mediasoup router
// ...
subscribe() // start consuming the stream
// ...
```

`remoteVideoElId` needs to be the id of the video element rendered on your site where the stream should be put into:

```html
<video
    id="remote-stream"
    controls
    autoplay="true"
    playsinline
    muted="muted"
></video>
```

## API

### useConsume(options: ConsumeOptions)

Returns functions for connecting to the [server](https://github.com/sandro-salzmann/mediasoup-easy-one-to-many-server) and subscribing to the video stream.

**ConsumeOptions**

| Field & Type                    | Description                                                                                                                        | Required | Default |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- |
| url <br /> *string*             | URL of the [server](https://github.com/sandro-salzmann/mediasoup-easy-one-to-many-server) where the mediasoup router is running on | Yes      |         |
| remoteVideoElId <br /> *string* | HTML id of a rendered `<video>` element where the remote stream should be displayed                                                | Yes      |         |
