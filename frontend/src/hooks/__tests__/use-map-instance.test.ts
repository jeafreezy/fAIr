import { act, renderHook } from '@testing-library/react-hooks';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi
  } from 'vitest';
import { DrawingModes } from '@/enums';
import { Map } from 'maplibre-gl';
import { setupMaplibreMap } from '@/components/map/setups/setup-maplibre';
import { setupTerraDraw } from '@/components/map/setups/setup-terra-draw';
import { useMapInstance } from '../use-map-instance';

vi.mock("@/components/map/setups/setup-maplibre");

vi.mock("@/components/map/setups/setup-terra-draw", () => ({
  setupTerraDraw: vi.fn().mockReturnValue({
    start: vi.fn(),
    setMode: vi.fn(),
  }),
}));

vi.mock("maplibre-gl", async () => {
  
  const actual = (await vi.importActual<any>("maplibre-gl")) || {};

  class MockMap {
    private eventHandlers: Record<string, Function[]> = {};

    on = vi.fn((eventName: string, callback: Function) => {
      if (!this.eventHandlers[eventName]) {
        this.eventHandlers[eventName] = [];
      }
      this.eventHandlers[eventName].push(callback);
    });

    off = vi.fn((eventName: string, callback?: Function) => {
      if (!callback) {
        delete this.eventHandlers[eventName];
      } else {
        this.eventHandlers[eventName] = (
          this.eventHandlers[eventName] || []
        ).filter((cb) => cb !== callback);
      }
    });

    fire = vi.fn((eventName: string, data?: any) => {
      const handlers = this.eventHandlers[eventName] || [];
      handlers.forEach((cb) => cb(data));
    });

    getZoom = vi.fn().mockReturnValue(0);

    remove = vi.fn(() => {});
  }
  return {
    ...actual,
    Map: MockMap,
  };
});

describe("useMapInstance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize map instance and set it on load", async () => {
    const mockMap = new Map({
      container: document.createElement("div"),
      style: "https://my-tile-server/style.json",
    });
    (setupMaplibreMap as vi.Mock).mockReturnValue(mockMap);

    const { result, waitForNextUpdate } = renderHook(() => useMapInstance());

    expect(result.current.map).toBeNull();

    act(() => {
      mockMap.fire("load");
    });

    expect(result.current.map).toBe(mockMap);
  });

  it("should set initial zoom level to 0", () => {
    const { result } = renderHook(() => useMapInstance());
    expect(result.current.currentZoom).toBe(0);
  });

  it("should update zoom level on zoomend event", async () => {
    const mockMap = new Map({
      container: document.createElement("div"),
      style: "https://my-tile-server/style.json",
    });
    (setupMaplibreMap as vi.Mock).mockReturnValue(mockMap);

    const { result, waitForNextUpdate } = renderHook(() => useMapInstance());

    act(() => {
      mockMap.fire("load");
    });

    act(() => {
      (mockMap.getZoom as vi.Mock).mockReturnValue(5);
      mockMap.fire("zoomend");
    });
    expect(result.current.currentZoom).toBe(6);
  });

  it("should initialize TerraDraw and start it", async () => {
    const mockMap = new Map({
      container: document.createElement("div"),
    });
    const mockTerraDraw = { start: vi.fn(), setMode: vi.fn() };

    (setupMaplibreMap as vi.Mock).mockReturnValue(mockMap);
    (setupTerraDraw as vi.Mock).mockReturnValue(mockTerraDraw);

    const { result, waitForNextUpdate } = renderHook(() => useMapInstance());

    act(() => {
      mockMap.fire("load");
    });

    expect(setupTerraDraw).toHaveBeenCalledWith(mockMap);
    expect(mockTerraDraw.start).toHaveBeenCalled();
    expect(result.current.terraDraw).toBe(mockTerraDraw);
  });

  it("should sync drawing mode with TerraDraw", async () => {
    const mockMap = new Map({
      container: document.createElement("div"),
    });
    const mockTerraDraw = { start: vi.fn(), setMode: vi.fn() };

    (setupMaplibreMap as vi.Mock).mockReturnValue(mockMap);
    (setupTerraDraw as vi.Mock).mockReturnValue(mockTerraDraw);

    const { result, waitForNextUpdate } = renderHook(() => useMapInstance());

    act(() => {
      mockMap.fire("load");
    });

    act(() => {
      result.current.setDrawingMode(DrawingModes.DRAW);
    });

    expect(mockTerraDraw.setMode).toHaveBeenCalledWith(DrawingModes.DRAW);
  });
});
