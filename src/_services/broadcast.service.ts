import {EventEmitter, Injectable, OnDestroy} from "@angular/core";

/**
 * Interface to ensure broadcast message uniformity.
 */
export interface IBroadcastMessage {
  source: string;
  target: string;
  action: string;
  payload: any;
}

/**
 * Provides a method to transmit data between browsers/tabs
 * within the same browser origin.
 */
@Injectable({
  providedIn: "root"
})
export class BroadcastService implements OnDestroy {

  /**
   * Event to notify subscribers of an incoming message.
   */
  messageReceived$: EventEmitter<IBroadcastMessage> = new EventEmitter<IBroadcastMessage>();

  private channel = new BroadcastChannel("my-broadcast-channel");

  constructor() {
    this.registerOnMessageHandler();
  }

  private registerOnMessageHandler = () => {
    if (this.channel) {
      // Handles errors in the broadcast.
      this.channel.onmessageerror = (me) => {
        this.messageReceived$.error(`source: ${me.source}, origin: ${me.origin}, data: ${me.data}`);
      };

      // Handles incoming messages and relays them to subscribers.
      this.channel.onmessage = (me: MessageEvent<IBroadcastMessage>) => {
        this.messageReceived$.emit(me.data);
      };
    }
  };

  /**
   * Sends a message out to all browsers/tabs within the same browser origin.
   * @param source The sender.
   * @param target The intended receiver.
   * @param action An action the sender wants the receiver to perform.
   * @param payload Data associated with the action (if any).
   */
  send(source: string, target: string, action: string, payload?: any) {
    if (this.channel) {
      const message: IBroadcastMessage = {source: source, target: target, action: action, payload: payload};
      this.channel.postMessage(message);
    }
  }

  ngOnDestroy(): void {
    this.channel.close();
  }
}
/* 
// USAGE:
this.broadcastService.send("a-different-component", "my-component", "action-1", { a: "thing" });
this.broadcastService.messageReceived$.subscribe((message: IBroadcastMessage) => {
  if (message.target == "my-component") {
    switch (message.action) {
      case "action-1":
        DoActionOne(message.payload);
        break;
      case "action-2":
        DoActionTwo(message.payload);
        break;
    }
  } else {
    // Not my monkey, not my circus.
  }
}); */