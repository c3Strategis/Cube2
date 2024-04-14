import { Injectable, signal } from '@angular/core';
import { Socket } from 'ngx-socket-io';
@Injectable({
   providedIn: 'root',
})
export class WebSocketService {
   private webSocket: Socket;
   public wsMessage = signal('')

   constructor() {
      this.webSocket = new Socket({
         url: "http://localhost:5000",
         options: {},
      });
   }

   // this method is used to start connection/handhshake of socket with server
   connectSocket(message: any) {
      this.webSocket.emit('connected', message);
   }

   // this method is used to get response from server
   receiveStatus() {
      console.log('Receive Status')
      return this.webSocket.fromEvent('/get-response');
   }

   receiveHello() {
      // console.log('something')
      return this.webSocket.fromEvent('hello');
   }
   // this method is used to end web socket connection
   disconnectSocket() {
      this.webSocket.disconnect();
   }

   sendMessage(message: any) {
      this.webSocket.emit('message', message);
   }



   initializeSocketConnection() {
      let currentUser = JSON.parse(localStorage.getItem('currentUser')!)
      console.log(currentUser)
      let packet = { 'token': currentUser.token, 'client': 'Map' }
      this.connectSocket(packet)
   }

   receiveSocketResponse() {
      this.receiveStatus().subscribe((receivedMessage: any) => {
         console.log(receivedMessage);
         if (receivedMessage.message) {
            this.wsMessage.set(receivedMessage.message) 
            // this.cql_filter = receivedMessage.message;
            // this.updateMap()
         }
         // console.log(this.cql_filter)
         // this.websocketService.receiveHello().subscribe((receivedMessage:any) => {
         //   console.log(receivedMessage)
         // })
      });
   }
}