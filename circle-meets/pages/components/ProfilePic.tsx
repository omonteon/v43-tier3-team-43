import type { UserType } from "../../types";

const ProfilePic = ({ user }: { user: UserType }) => {
  const status = returnStatusColor(user?.status);
  return (
    <div className="profile-pic">
      <img src={user?.imageUrl} />
      <div id="status" className={status + " rounded-50"}></div>
    </div>
  );
};
export default ProfilePic;

function returnStatusColor(status: string) {
  if (status == "online") return "bg-CommunixGreen";
  if (status == "offline") return "hidden";
  if (status == "away") return "bg-red";
}
