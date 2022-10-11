import { PrismaService } from "../prisma.service";
import { IAccount, IChannel } from "../interfaces";

export async function setChannel(this: PrismaService, channel: IChannel, creatorId: string) {
  try {
    await this.prisma.channel.create({
      data: {
        channelName: channel.channelName,
        creatorId: creatorId,
        isDirect: channel.isDirect,
        isPrivate: channel.isPrivate,
        is_pwd: false,
      },
    });
  }
  catch (error) {
    console.log(error.message);
  }
}

export async function setChannelMessage(this: PrismaService, userId: string, channel_name: string, message: string, isNotif: boolean) {
  try {
    await this.prisma.channelMessage.create({
      data: {
        message: message,
        userId: userId,
        channelId: channel_name,
        isRead: false,
        isNotif: isNotif,
      },
    });
  }
  catch (error) {
    console.log(error.message);
  }
}

export async function setJoinChannel(this: PrismaService, login: string, channel_name: string) {
  try {
    await this.prisma.joinChannel.create({
      data: {
        login: login,
        channelId: channel_name,
      },
    });
  }
  catch (error) {
    console.log(error.message);
  }
}

export async function leaveChannel(this: PrismaService, userId: string, channel_name: string) {
  try {
    let login = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { login: true }
    });
    await this.prisma.joinChannel.delete({
      where: { 
        channelId_login: {
          login: login.login,
          channelId: channel_name,
        }
      }
    });
  }
  catch (error) {
    console.log(error.message);
  }
}

export async function setMuteUser(this: PrismaService, channel_name: string, login: string, duration: number) {
  try {
    await this.prisma.muteUser.create({
      data: {
        channelId: channel_name,
        login: login,
        duration: duration,
      },
    });
  }
  catch (error) {
    console.log(error.message);
  }
}

export async function deleteMuteUser(this: PrismaService, channel_name: string, login: string) {
  try {
    await this.prisma.muteUser.delete({
      where: {
        channelId_login: {
          channelId: channel_name,
          login: login,
        }
      }
    });
  }
  catch (error) {
    console.log(error.message);
  }
}

export async function getMuteInfo(this: PrismaService, channel_name: string, login: string) {
  try {
    const mute = await this.prisma.muteUser.findUnique({
      where: {
        channelId_login: {
          login: login,
          channelId: channel_name,
        }
      },
      select: {
        createdAt: true,
        duration: true,
      },
    });
    return mute;
  }
  catch (error) {
    console.log(error.message);
  }
}

export async function setBanUser(this: PrismaService, channel_name: string, login: string, duration: number) {
  try {
    await this.prisma.banUser.upsert({
      where: {
        channelId_login: {
          login: login,
          channelId: channel_name,
        }
      },
      update: { duration: duration },
      create: {
        login: login,
        channelId: channel_name,
        duration: duration,
      },
    });
  }
  catch (error) {
    console.log(error.message);
  }
}

export async function deleteBan(this: PrismaService, channel_name: string, login: string) {
  try {
    await this.prisma.banUser.delete({
      where: {
        channelId_login: {
          login: login,
          channelId: channel_name,
        }
      }
    });
  }
  catch (error) {
    console.log(error.message);
  }
}

export async function isAdmin(this: PrismaService, channel_name: string, userId: string): Promise<boolean> {
  try {
    const channels = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {adminChannel: {select: {channelId: true}}}
    });
    for (let i in channels.adminChannel) {
      if (i == channel_name) {
        return true;
      }
    }
    return false;
  }
  catch (error) {
    console.log(error.message);
  }
}

export async function isCreator(this: PrismaService, channel_name: string, userId: string): Promise<boolean> {
  try {
    const channel = await this.prisma.channel.findUnique({
      where: {
        channelName: channel_name
      },
      select: {
        creatorId: true,
      }
    });
    if (channel.creatorId == userId) {
      return true;
    }
    return false;
  }
  catch (error) {
    console.log(error.message);
  }
}

export async function setMakeAdmin(this: PrismaService, login: string, channel_name: string) {
  try {
    await this.prisma.makeAdmin.create({
      data: {
        channelId: channel_name,
        login: login,
      },
    });
  }
  catch (error) {
    console.log(error.message)
  }
}

export async function deleteMakeAdmin(this: PrismaService, login: string, channel_name: string) {
  try {
    await this.prisma.makeAdmin.delete({
      where: {
        channelId_login: {
          login: login,
          channelId: channel_name,
        }
      }
    });
  }
  catch (error) {
    console.log(error.message);
  }
}

export async function setChannelPass(this: PrismaService, channel_name: string, pwd: string) {
  try {
    await this.prisma.channel.update({
      where: { channelName: channel_name },
      data: { is_pwd: true, pwd: pwd },
    });
  }
  catch (error) {
    console.log(error.message);
  }
}

export async function removeChannelPass(this: PrismaService, channel_name: string) {
  try {
    await this.prisma.channel.update({
      where: { channelName: channel_name },
      data: { is_pwd: false, pwd: null },
    });
  }
  catch (error) {
    console.log(error.message);
  }
}

export async function getChannelUsers(this: PrismaService, channel_name: string): Promise<IAccount[]> {
  try {
    const channel = await this.prisma.channel.findUnique({
      where: { channelName: channel_name },
      select: {
        userList: {
          select: { user: { select: {
            login: true,
            nickName: true,
            email: true,
            score: true,
            imgUrl: true,
            isOnline: true,
          }}}
        }
      }
    });
    let list: IAccount[] = [];
    for (let i = 0; channel.userList[i]; i++) {
      let tmp = {} as IAccount;
      tmp.login = channel.userList[i].user.login;
      tmp.nickName = channel.userList[i].user.nickName;
      tmp.email = channel.userList[i].user.email;
      tmp.score = channel.userList[i].user.score;
      tmp.avatar = channel.userList[i].user.imgUrl;
      tmp.isOnline = channel.userList[i].user.isOnline;
      list.push(tmp);
    }
    return list;
  }
  catch (error) {
    console.log(error.message);
  }
}

export async function getPublicChannels(this: PrismaService): Promise<IChannel[]> {
  try {
    const channels = await this.prisma.channel.findMany({
      where: {
        isPrivate: {
          equals: false,
        },
      },
      select: {
        channelName: true,
      }
    });
    return channels;
  }
  catch (error) {
    console.log(error.message);
  }
}

export async function getchannelsForUser(this: PrismaService, userid: string, skip: number, take: number): Promise<IChannel[]> {
  try {
    const channels = await this.prisma.user.findUnique({
      where: { id: userid },
      select: {
        channelList: {
          select: {
            channelId: true,
          },
          orderBy: {
            channel: {
              updatedAt: 'desc',
            }
          },
          skip: skip,
          take: take,
        },
      },
    });
    let list: IChannel[] = [];
    for (let i = 0; channels.channelList[i]; i++) {
      let tmp: IChannel = { channelName: channels.channelList[i].channelId };
      list.push(tmp);
    }
    return list;
  }
  catch (error) {
    console.log(error.message);
  }
}

export async function getChannelInfo(this: PrismaService, channel_name: string): Promise<IChannel> {
  try {
    const chan = await this.prisma.channel.findUnique({
      where: { channelName: channel_name },
      select: {
        channelName: true,
        createdAt: true,
        is_pwd: true,
        pwd: true,
        isPrivate: true,
        isDirect: true,
        creator: {
          select: {
            login: true,
          }
        },
        userList: {
            select: {
                login: true,
            }
        },
        userAdminList: {
            select: {
                login: true,
            }
        },
        mutedUserList: {
            select: {
                login: true,
            }
        },
        bannedUsers: {
            select: {
                login: true,
            }
        },
        messages: {
            select: {
                createdAt: true,
                message: true,
                user: {select : {login: true}},
            }
        }
      }
    });
    let channel = {} as IChannel;
    if (chan) {
      channel = {
        channelName: chan.channelName,
        createdAt: chan.createdAt,
        is_pwd: chan.is_pwd,
        password: chan.pwd,
        isPrivate: chan.isPrivate,
        isDirect: chan.isDirect,
        creator: chan.creator.login,
        users: chan.userList,
        admins: chan.userAdminList,
        mutedUsers: chan.mutedUserList,
        bannedUsers: chan.bannedUsers,
        messages: [],
      }
      for (let i in chan.messages) {
        channel.messages.push({
          createdAt: chan.messages[i].createdAt,
          message: chan.messages[i].message,
          user: chan.messages[i].user.login,
        });
      }
    }
    return channel;
  }
  catch (error) {
    console.log(error.message);
  }
}