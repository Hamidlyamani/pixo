"use client";

import { RoomUser, ToolOptions } from "../../../../../types";
import BrushCategorySelector from "./helpers/BrushCategorySelector";
import { LuCrown } from "react-icons/lu";
type SidebarProps = {
  options: ToolOptions;
  setOptions: React.Dispatch<React.SetStateAction<ToolOptions>>;
  onExportJpg:() => void;
  users: RoomUser[];
  mySocketId?: string;
  ownerId: string | null;
}

export default function Sidebar({ options, setOptions, onExportJpg, users, mySocketId, ownerId }: SidebarProps) {
 const update = <K extends keyof ToolOptions>(
  key: K,
  value: ToolOptions[K]
): void => {
  setOptions((prev) => ({
    ...prev,
    [key]: value,
  }));
};
  const classIpute = "flex items-center justify-center pl-1 w-[30px]"
  return (<>
    <div className="">
      <div className="border-b border-white p-2 font-semibold text-xs bg-blue-200"> Tool options </div>
      <div className="flex h-full  gap-4 p-2 flex-col text-sm bg-blue-50 m-1">
        <div className="sep flex gap-1 w-full  items-center font-thin text-xs "> <span>Brushs</span> <div className="h-[1px] block w-full bg-gray-400 "></div></div>
        <BrushCategorySelector options={options} setOptions={setOptions} />
        <div className="flex gap-2 text-xs  text-gray-600">

          <div className="flex justify-between gap-1 w-1/2">
            <label>Size</label>
            <input
              type="text"
              className={classIpute}
              min={8}
              max={96}
              value={options.strokeWidth}
              onChange={(e) => update("strokeWidth", Number(e.target.value))}
            />
          </div>
          <div className="flex justify-between gap-1 w-1/2">
            <label>Opacity</label>
            <input
              type="number"
              className={classIpute}
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
        <div className="flex  text-xs text-gray-600 gap-2">
          <div className="w-1/2 justify-between flex gap-1 ">
            <label>Space</label>
            <input
              type="text"
              className={classIpute}
              min={0}
              max={20}
              value={options.spacing || 0}
              onChange={(e) =>
                setOptions({ ...options, spacing: parseInt(e.target.value) })
              }
            />
          </div>
          {/* Smoothing */}
          <div className="w-1/2 justify-between flex gap-1">
            <label>Smooth</label>
            <input
              type="number"
              className={classIpute}
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
        <div className="sep flex gap-1 w-full  items-center font-thin text-[10px] "> <span>Colors</span> <div className="h-[1px] block w-full bg-gray-400 "></div></div>
        <div className="flex gap-2 text-xs text-gray-700">
          <div className="flex gap-1 w-1/2">
            <label>Stroke</label>
            <input
              type="color"
              value={options.color}
              onChange={(e) => update("color", e.target.value)}
            />
          </div>
          <div className="flex gap-1 w-1/2">
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
              type="text"
              className="flex items-center justify-center pl-1 w-[30px] "
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
      </div>
    </div>
    <div className="mt-2">
      <div className="border-b border-white p-2 font-semibold text-xs bg-blue-200 mb-1 ">User list ({users.length})</div>
      <div className="space-y-1 min-h-[140px] max-h-[140px] overflow-y-auto bg-blue-50 m-1 text-[11px]">
        {users.map((u) => (
          <div
            key={u.id}
            className="flex items-center justify-between rounded-sm border-b border-gray-400 border-bottom-2 px-2 py-0 text-[11px] "
          >
            <span className="truncate">{u.name}</span>
            <div className="flex gap-1">
              {u.id === mySocketId && (
                <span className=" opacity-70">(me)</span>
              )}
              {u.id === ownerId && <span className="text-[11px]"><LuCrown /></span>}
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <div className=" opacity-70">No users</div>
        )}
      </div>
    </div>
    <div className="mt-2">
      <div className="border-b border-white p-2 font-semibold text-xs bg-blue-200 mb-1 ">Export</div>
      <div className="space-y-2  bg-blue-50 m-1 text-[11px]">
        <button
          onClick={onExportJpg}
          className="px-2 py-1 rounded-sm bg-gray-600 text-white w-full mb-5 md:mb-1"
        >
          Export as JPG
        </button>
      </div>
    </div>



  </>
  );
}
