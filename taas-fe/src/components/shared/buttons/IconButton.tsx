export const IconButton = ({ icon, alt }: { icon: string; alt: string }) => (
  <div className="border border-gray-200 p-1.5 w-fit h-fit bg-white rounded-md">
    <img src={icon} alt={alt} className="w-4 h-4" />
  </div>
);
