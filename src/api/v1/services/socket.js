const notiController = require("../controller/noti.cont");
let userArray = [];

const pushUser = (user) => {
  const isUser = userArray.some((u) => u.user_id === user.user_id);
  if (!isUser) {
    userArray.push(user);
  }
  return userArray;
};

const delUser = (socketId) => {
  const newArray = userArray.filter((u) => u.socket_id !== socketId);

  userArray = [...newArray];
};

// get receivers from onlineUsers

const findSocketId = (receiver) => {
  console.log("FIND SOCKET ID BY USERID");

  const b = userArray.filter((u) => receiver.toString() === u.user_id);

  if (b.length === 1) {
    return b[0].socket_id;
  } else {
    return "";
  }
};

const connect = (io) => {
  try {
    io.on("connection", (socket) => {
      const user_id = socket.payload.userId;
      const newArray = pushUser({ user_id, socket_id: socket.id });

      console.log("CONNECTING SOCKET...");

      socket.on("ping", () => {
        console.log("pong");
      });

      socket.on("send_noti", async (data) => {
        console.log(data);
        const newNoti = await notiController.addNotification(data);
        // console.log("newNoti")
        const status = newNoti?.status;
        if (status === "success") {
          const receiver = newNoti.data.receiver;
          const _receiver = findSocketId(receiver);

          io.to(_receiver).emit("emit_notis", newNoti);
        }
      });

      socket.on("disconnect", () => {
        console.log("SOCKET DISCONECTED");
        delUser(socket.id);
      });
    });
  } catch (error) {
    console.log("SOCKET ERROR:  " + error);
  }
};

module.exports = { connect };
