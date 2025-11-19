export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-black border-t border-gray-800 text-gray-400 z-50">
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 py-4 text-sm text-gray-500">
        <span>
          &copy; {new Date().getFullYear()} MilkCord — вайб нового поколения.
        </span>
      </div>
    </footer>
  );
}
