import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IChannel, IMessage } from '../../interfaces';
// import { channelI } from '../models/channel.model';
// import { MessageI } from '../models/chat.model';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  @ViewChild("messageContainer")
  mContainer!: ElementRef;

  create: boolean = false;

  contacts: string[] = ["John Potter", "Jane McGiller", "Joe Froster", "Jill Smith", "Jenny Smith", "Henry Colmard", "Stuart Little", "John Doe", "Jane Doe", "Joe Doe", "Jill Doe", "Jenny Doe", "Henry Doe", "Stuart Doe"];
  selectedChannel!: IChannel;
  curMessage!: string;
  myId!: string;

  constructor(private chatServ: ChatService) { }
  

  ngOnInit(): void {
    this.chatServ.getAddedMessageObs().subscribe((message: IMessage) => {
      if (this.selectedChannel && this.selectedChannel.messages &&
          message.channelId == this.selectedChannel.channelName) {
        this.selectedChannel.messages.push(message);
      }
    });
    this.chatServ.getMessagesObs().subscribe((messages: IMessage[]) => {
      if (this.selectedChannel && messages[0].channelId == this.selectedChannel.channelName)
        this.selectedChannel.messages = messages;
    });
    this.chatServ.getChannelInfoObs().subscribe((channel: IChannel) => {
      console.log(channel);
      this.selectedChannel = channel;
    });
    this.chatServ.getChannelsObs().subscribe((rooms: IChannel[]) => {
      this.contacts = rooms.map((room) => room.channelName);
    });
    this.chatServ.getErrorObs().subscribe((error: string) => {
      console.log(error);
    });
    this.chatServ.getMyIdObs().subscribe((id: string) => {
      this.myId = id;
    });
  }

  ngAfterViewChecked() {
    if (this.mContainer) {
      this.mContainer.nativeElement.scrollTop = this.mContainer.nativeElement.scrollHeight;
    }
  }
  get myLogin() {
    return 'adesvall';
    // return this.selectedChannel.users?.find((user) => user.id == this.myId)?.login;
  }
  isAdmin(login: string) {
    if (this.selectedChannel && this.selectedChannel.admins) {
      return this.selectedChannel.admins.map((user) => user.login).includes(login);
    }
    return false;
  }
  onSendMessage() {
    this.chatServ.sendMessage({
      message: this.curMessage,
      from: "me",
      channelId: this.selectedChannel.channelName,
      createdAt: new Date()
    });
    // this.messages.push({user: "me",
    //                   text: this.curMessage,
    //                   channel : this.selectedChannel.channelName, 
    //                   createdAt: new Date(),
    //                  }); // suppr
    this.curMessage = "";
  }
  
  onContactClick(contact: string) {
    this.chatServ.getChannelInfo(contact);
    this.create = false;
  }
  onLeave() {
    this.chatServ.leaveChannel(this.selectedChannel.channelName);
    this.selectedChannel.messages = undefined;
  }
  onMute(id: string) {
    this.chatServ.muteUser(id, this.selectedChannel.channelName);
  }
  onBan(id: string) {
    this.chatServ.banUser(this.selectedChannel.channelName, id);
  }
  onPromote(id: string) {
    this.chatServ.promoteUser(this.selectedChannel.channelName, id);
  }

}
