import mediasoup, { Device } from "mediasoup-client";
import { RtpCapabilities } from "mediasoup-client/lib/RtpParameters";
import { useState } from "react";
import { io } from 'socket.io-client';

process.env.DEBUG = "mediasoup*"; // for testing purposes

export const useConsume = () => {
    let device: mediasoup.Device;
    let consumerTransport: mediasoup.types.Transport;
    let remoteStream: MediaStream

    const socket = io("http://localhost:3014/mediasoup");

    const connect = () => {
        socket.on("connect_error", (err) => {
            console.error(err)
        })
        socket.on("connect_timeout", (err) => {
            console.error(err)
        })
        socket.on("connect", () => {
            socket.emit("getRouterRtpCapabilities", (rtpCapabilities: RtpCapabilities) => {
                loadDevice(rtpCapabilities);
            });
        });
        socket.connect();
    }

    const loadDevice = async (routerRtpCapabilities: RtpCapabilities) => {
        try {
            device = new Device();
        } catch (error: any) {
            console.log(error)
            if (error.name === "UnsupportedError") {
                console.log("Browser not supported!");
            }
        }

        try {
            await device.load({ routerRtpCapabilities });
        } catch (error) {
            console.log(error);
        }
    };

    const subscribe = () => {
        socket.emit("createConsumerTransport", (res: any) => {
            if (res.ok) {
                onConsumerTransportCreated(res.params);
            } else {
                console.error(res.msg, res.error);
            }
        });
    };

    const onConsumerTransportCreated = (params: mediasoup.types.TransportOptions) => {
        const transport = device.createRecvTransport(params);
        consumerTransport = transport;

        transport.on("connect", ({ dtlsParameters }, callback, errback) => {
            socket.emit("connectConsumerTransport", dtlsParameters, () => {
                callback();
            });
        });

        transport.on("connectionstatechange", async (state) => {
            switch (state) {
                case "connecting":
                    break;
                case "connected":
                    // @ts-ignore
                    document.getElementById("remote-stream").srcObject = remoteStream
                    socket.emit("resume", () => {
                    });
                    break;
                case "failed":
                    transport.close();
                    break;
                default:
                    break;
            }
        });

        consume();
    };


    const consume = async () => {
        const { rtpCapabilities } = device;
        socket.emit("consume", rtpCapabilities, (res: any) => {
            if (res.ok) {
                onSubscribed(res.params);
            } else {
                console.error(res.msg, res.error);
            }
        });
    };

    const onSubscribed = async (params: mediasoup.types.ConsumerOptions) => {
        const consumer = await consumerTransport.consume(params);
        const stream = new MediaStream();
        stream.addTrack(consumer.track);
        remoteStream = stream;
    };

    return { connect, subscribe }
}
