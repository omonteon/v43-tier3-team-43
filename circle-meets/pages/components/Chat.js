import RightMessage from "./RightMessage";
import LeftMessage from "./LeftMessage";

const Chat = ({ user, users, conversation = [] }) => {
  // need to check if message hasn't been read by the recipient, and if it hasn't, and this is it, we need to update that

  return (
    <div className="flex flex-col min-h-screen white-grid items-center">
      <header>
        <h1 className="text-2xl text-center my-8">TITLE</h1>
      </header>
      <ul className="flex flex-col justify-start w-2/5 bg-communixWhite border-t-8 border-communixWhite">
        {conversation.map((message) => {
          {
            if (message.sender == user.id) {
              return (
                <RightMessage
                  message={message.body}
                  sender={message.sender}
                  readCount={users.length - 1 - message.readBy.length}
                />
              );
            } else {
              return (
                <LeftMessage
                  message={message.body}
                  sender={message.sender}
                  readCount={users.length - 1 - message.readBy.length}
                />
              );
            }
          }
        })}
      </ul>
    </div>
  );
};

export default Chat;
