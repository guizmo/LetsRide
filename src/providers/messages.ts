import { Injectable } from '@angular/core';


@Injectable()
export class MessagesProvider {

  buddy: any;
  conversation: any;
  messages = [];

  constructor(
  ) {
    console.log('Hello MessagesProvider Provider');
  }

  getAllThreads() {
  }

  getThread(threadId) {
  }

  createThread(details, msg) {
  }

  addMessage(msg) {
  }


}
