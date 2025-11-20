import PHAvatarOther from "./PHAvatarOther";
import PHCover from "./../PHCover";
import PHInfoOther from "./PHInfoOther";

export default function ProfileHeaderOther({ user, otherUser }) {
  return (
    <div className="relative bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-[0_0_25px_rgba(163,230,53,0.05)]">
      <PHCover user={otherUser} />

      <div className="relative z-10 flex flex-col md:flex-row gap-8 p-6">
        <PHAvatarOther user={otherUser} />

        <PHInfoOther user={user} otherUser={otherUser} />
      </div>
    </div>
  );
}
