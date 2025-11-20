import UserAPI from "../../../../app/api/UserApi";

export default function PHAvatarOther({ user }) {
  return (
    <div className="shrink-0 flex justify-center md:justify-start relative">
      <div className="relative cursor-pointer group">
        <div
          className="w-40 h-40 rounded-2xl bg-gray-900 border border-lime-400/40 
                     overflow-hidden flex items-center justify-center 
                     text-5xl font-bold text-white 
                     shadow-[0_0_30px_rgba(163,230,53,0.25)] 
                     transition-transform duration-300 
                     group-hover:scale-105 group-hover:shadow-[0_0_50px_rgba(163,230,53,0.45)]"
        >
          <img
              src={UserAPI.getAvatarUrl(user.avatar_url)}
              alt="avatar"
              className="w-full h-full object-cover"
            />
        </div>
      </div>
    </div>
  );
}
