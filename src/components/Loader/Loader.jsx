export default function Loader({ children }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"></div>
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-lime-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lime-300 font-medium text-sm">{children}</p>
      </div>
    </>
  );
}
