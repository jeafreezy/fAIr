export const MapCursorToolTip = ({
  color = "bg-black",
  tooltipVisible = true,
  tooltipPosition,
  children,
}: {
  color?: string;
  tooltipPosition: Record<string, number>;
  tooltipVisible?: boolean;
  children: React.ReactNode;
}) => {
  if (!tooltipVisible) return null;

  return (
    <div
      className={`w-50 pointer-events-none absolute flex flex-col text-nowrap rounded-lg px-2 text-white shadow-2xl ${color}`}
      style={{
        left: `${tooltipPosition.x}px`,
        top: `${tooltipPosition.y}px`,
      }}
    >
      {children}
    </div>
  );
};
