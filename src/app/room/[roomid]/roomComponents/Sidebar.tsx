"use client";

import BrushCategorySelector from "./helpers/BrushCategorySelector";


export default function Sidebar({ options, setOptions }: any) {
  const update = (key: string, value: any) =>
    setOptions({ ...options, [key]: value });

  return (
    <div className="flex h-full bg-blue-100 gap-4 p-2 flex-col text-sm">

      <div className="sep flex gap-1 w-full  items-center font-thin text-[10px] "> <span>Colors</span> <div className="h-[1px] block w-full bg-gray-400 "></div></div>
      <div className="flex gap-2 text-xs text-gray-700">
        <div className="flex gap-1 ">
          <label>Color</label>
          <input
            type="color"
            value={options.color}
            onChange={(e) => update("gradientFrom", e.target.value)}
          />
        </div>
        <div className="flex gap-1">
          <label>Fill</label>
          <input
            type="color"
            value={options.fill}
            onChange={(e) => update("fill", e.target.value)}
          />
        </div>
      </div>

      <div className="sep flex gap-1 w-full  items-center font-thin text-[10px] "> <span>Fonts</span> <div className="h-[1px] block w-full bg-gray-400 "></div></div>
      <div className="flex gap-2 text-xs text-gray-600">
        <div className="flex gap-1">
          <label>Size</label>
          <input
            type="number"
            className="flex items-center justify-center pl-1 w-[40px] "
            min={8}
            max={96}
            value={options.fontSize}
            onChange={(e) => update("fontSize", Number(e.target.value))}
          />
        </div>
        <div className="flex gap-1">
          <label>Family</label>
          <select className="w-12"
            value={options.fontFamily}
            onChange={(e) => update("fontFamily", e.target.value)}
          >
            <option>Arial</option>
            <option>Inter</option>
            <option>Comic Sans MS</option>
            <option>Montserrat</option>
          </select>
        </div>
      </div>
      {/* <div className="sep flex gap-1 w-full  items-center font-thin text-xs "> <span>Gradient</span> <div className="h-[1px] block w-full bg-gray-400 "></div></div> */}
      {/* <div className="flex gap-2 text-xs text-gray-600">
        <div className="flex gap-1">

          <label>Color 1</label>
          <input
            type="color"
            value={options.gradientFrom}
            onChange={(e) => update("gradientFrom", e.target.value)}
          />
        </div>
        <div className="flex gap-1">
          <label>Color 2</label>
          <input
            type="color"
            value={options.gradientTo}
            onChange={(e) => update("gradientTo", e.target.value)}
          />
        </div>
      </div> */}
      <div className="sep flex gap-1 w-full  items-center font-thin text-xs "> <span>Brushs</span> <div className="h-[1px] block w-full bg-gray-400 "></div></div>
      <BrushCategorySelector options={options} setOptions={setOptions} />
      <div className="flex gap-1 text-xs text-gray-600">
        <div className="flex gap-1">
          <label>Size</label>
          <input
            type="number"
            className="flex items-center justify-center pl-1 w-[40px] "
            min={8}
            max={96}
            value={options.strokeWidth}
            onChange={(e) => update("strokeWidth", Number(e.target.value))}
          />
        </div>
        <div className="flex gap-1">
          <label>Opacity</label>
          <input
            type="number"
            className="flex items-center justify-center pl-1 w-[40px]"
            min={0}
            max={1}
            step={0.01}
            value={options.opacity ?? 1} // valeur par défaut 1
            onChange={(e) => {
              let val = parseFloat(e.target.value);

              // S'assure que la valeur reste entre 0 et 1
              if (isNaN(val)) val = 0;
              if (val > 1) val = 1;
              if (val < 0) val = 0;

              setOptions({ ...options, opacity: val });
            }}
          />



        </div>
      </div>
      <div className="flex gap-1 text-xs text-gray-600">
        <label>Space</label>
        <input
          type="number"
          min={0}
          max={20}
          value={options.spacing || 0}
          onChange={(e) =>
            setOptions({ ...options, spacing: parseInt(e.target.value) })
          }
        />

        {/* Smoothing */}
        <label>Smooth</label>
        <input
          type="number"
          min={0}
          max={1}
          step={0.05}
          value={options.smoothing || 0}
          onChange={(e) => {
            let val = parseFloat(e.target.value);

            // S'assure que la valeur reste entre 0 et 1
            if (isNaN(val)) val = 0;
            if (val > 1) val = 1;
            if (val < 0) val = 0;

            setOptions({ ...options, smoothing: val });
          }}

        />
      </div>
      
    </div>
  );
}
