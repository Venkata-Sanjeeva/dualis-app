const ButtonLoader = ({ message = "Processing...", appMode }) => {
  const isCorp = appMode === 'corporate';
  
  // Define theme-based text colors
  const textColor = isCorp ? "text-blue-100" : "text-emerald-100";

  return (
    <div className={`flex items-center justify-center gap-3 ${textColor}`}>
      <div className="dot-loader">
        <span />
        <span />
        <span />
      </div>
      <span className="text-sm font-bold tracking-wide uppercase italic">
        {message}
      </span>
    </div>
  );
};
export default ButtonLoader;