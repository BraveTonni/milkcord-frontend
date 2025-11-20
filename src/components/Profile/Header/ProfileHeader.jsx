
import PHAVatar from "./PHAvatar";
import PHCover from "./PHCover";
import PHInfo from "./PHInfo";

export default function ProfileHeader({ user, setUser , editingProfile, setEditingProfile }) {
  return (
    <div className="relative bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-[0_0_25px_rgba(163,230,53,0.05)]">
      <PHCover user={user} setUser={setUser} editingProfile={editingProfile} />

      <div className="relative z-10 flex flex-col md:flex-row gap-8 p-6">
        <PHAVatar user={user} setUser={setUser} editingProfile={editingProfile} />

        <PHInfo user={user} setUser={setUser} editingProfile={editingProfile} setEditingProfile={setEditingProfile} />
      </div>
    </div>
  );
}
