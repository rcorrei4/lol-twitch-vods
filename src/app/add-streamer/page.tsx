import { Button } from "../components/Button/Button";

export default function addStreamer() {
  return (
    <div className="p-3 flex flex-col justify-center gap-5">
      <h1 className="mt-5 text-3xl text-center sm:text-5xl">
        Add new streamer
      </h1>
      <form className="flex flex-col justify-center gap-5">
        <div className="bg-gray-three p-5 rounded">
          <input
            className="mb-5 h-[40px] text-[14px] text-white/60 w-full outline-none bg-gray-two text-[#f4f4f5] px-3 py-1 rounded-[5px] border border-gray-three focus:ring-1 focus:ring-gray-three focus:ring-offset-1 focus:ring-offset-gray-two transition-all duration-400 ease-in-out"
            name="text"
            type="text"
            placeholder="Twitch account"
          />
          <Button>Next</Button>
        </div>
        <div className="bg-gray-three p-5 rounded">
          <div className="grid grid-cols-3 gap-2">
            <input
              className="mb-5 h-[40px] text-[14px] text-white/60 flex-1 outline-none bg-gray-two text-[#f4f4f5] px-3 py-1 rounded-[5px] border border-gray-three focus:ring-1 focus:ring-gray-three focus:ring-offset-1 focus:ring-offset-gray-two transition-all duration-400 ease-in-out"
              name="username"
              type="text"
              placeholder="LOL Username"
            />
            <input
              className="mb-5 h-[40px] text-[14px] text-white/60 flex-1 outline-none bg-gray-two text-[#f4f4f5] px-3 py-1 rounded-[5px] border border-gray-three focus:ring-1 focus:ring-gray-three focus:ring-offset-1 focus:ring-offset-gray-two transition-all duration-400 ease-in-out"
              name="tag"
              type="text"
              placeholder="TAG"
            />
            <select
              className="mb-5 h-[40px] text-[14px] text-white/60 flex-1 outline-none bg-gray-two text-[#f4f4f5] px-3 py-1 rounded-[5px] border border-gray-three focus:ring-1 focus:ring-gray-three focus:ring-offset-1 focus:ring-offset-gray-two transition-all duration-400 ease-in-out appearance-none"
              name="servers"
              id="servers"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath fill='white' d='M10 12l-4-4h8l-4 4z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.75rem center",
                backgroundSize: "1rem",
              }}
            >
              <option value="br">BR</option>
              <option value="eune">EUNE</option>
              <option value="euw">EUW</option>
              <option value="jp">JP</option>
              <option value="kr">KR</option>
              <option value="lan">LAN</option>
              <option value="las">LAS</option>
              <option value="na">NA</option>
              <option value="oce">OCE</option>
              <option value="tr">TR</option>
              <option value="me">ME</option>
              <option value="ru">RU</option>
            </select>
          </div>

          <Button>Back</Button>
        </div>
        <Button type="submit" className="ml-auto">
          Add streamer
        </Button>
      </form>
    </div>
  );
}
