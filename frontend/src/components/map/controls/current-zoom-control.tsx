export const ZoomLevel = ({ currentZoom }: { currentZoom: number }) => {
  return (
    <div className="rounded-lg border border-gray-border bg-white px-3 py-1.5 md:border-0">
      <p className="text-body-4 md:text-body-3">Zoom level: {currentZoom}</p>
    </div>
  );
};
