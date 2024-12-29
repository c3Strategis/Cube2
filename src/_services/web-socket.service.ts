import { Injectable, signal, effect } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject } from 'rxjs';
import { CQLModel } from '../app/feature-modules/feature-modules/crash/crash-analysis/config-model';
import { environment } from '../environments/environment';

export class message {
   clientFrom!: string
   clientTo!: string
   message!: string
   data!: string | number
}

@Injectable({
   providedIn: 'root',
})
export class WebSocketService {
   private webSocket: Socket;
   public wsMessage = signal('')

   constructor() {
      this.webSocket = new Socket({
         url: environment.apiUrl,
         options: {},
      });
      
   }

   // this method is used to start connection/handhshake of socket with server
   connectSocket(message: any) {
      this.webSocket.emit('connected', message);
   }

   // this method is used to get response from server
   receiveStatus() {
      return this.webSocket.fromEvent('/get-response');
   }

   receiveHello() {
      return this.webSocket.fromEvent('hello');
   }
   // this method is used to end web socket connection
   disconnectSocket() {
      this.webSocket.disconnect();
   }

   sendMessage(message: any) {
      this.webSocket.emit('message', message);
   }

   initializeSocketConnection(client: string) { 
      let currentUser = JSON.parse(localStorage.getItem('currentUser')!)
      let packet = { 'token': currentUser.token, 'client': client }
      this.connectSocket(packet)
   }

   receiveSocketResponse() {
      this.receiveStatus().subscribe((receivedMessage: any) => {
         if (receivedMessage.message) {
            this.wsMessage.set(receivedMessage.message) 
         }
      });
   }
  
}
 