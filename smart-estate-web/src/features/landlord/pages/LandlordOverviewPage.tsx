import { Calendar as CalendarIcon, Search, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Building } from "lucide-react";
import { Link } from "react-router-dom";

const STATS = [
  { label: "Total income", value: "$966.47", change: "+17.4%", positive: true, icon: Building },
  { label: "Total properties", value: "50", change: "-4%", positive: false, icon: Building },
  { label: "Properties rented", value: "24", change: "+7.9%", positive: true, icon: Building },
];

const LISTINGS = [
  { id: 1, title: "Krasnodar, Villa", location: "No 5, Idumota Street, Lagos", specs: ["1,600 sqft", "4 beds", "3 bathrooms"], price: "$4,500", status: "Rented", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80" },
  { id: 2, title: "Rubtsovsk, Semi-detached", location: "6391 Elgin St. Celina, Delaware 10299", specs: ["1,600 sqft", "4 beds", "3 bathrooms"], price: "$446.61", status: "Vacant", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80" },
  { id: 3, title: "Gelsenkirchen, Duplex", location: "1901 Thornridge Cir. Shiloh, Hawaii 81063", specs: ["1,600 sqft", "4 beds", "3 bathrooms"], price: "$396.84", status: "Rented", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80" },
];

const MESSAGES = [
  { id: 1, name: "Theresa Webb", text: "What locations are available...", time: "06:32 pm", avatar: "https://i.pravatar.cc/150?u=1" },
  { id: 2, name: "Darlene Robertson", text: "You: Did you like the place I t...", time: "05:36 pm", avatar: "https://i.pravatar.cc/150?u=2" },
  { id: 3, name: "Cody Fisher", text: "Hi John, I really enjoyed my s...", time: "05:51 am", avatar: "https://i.pravatar.cc/150?u=3" },
  { id: 4, name: "Wade Warren", text: "You: Wade, your apartment i...", time: "05:49 pm", avatar: "https://i.pravatar.cc/150?u=4" },
  { id: 5, name: "Devon Lane", text: "Send me a full invoice of my...", time: "07:38 am", avatar: "https://i.pravatar.cc/150?u=5" },
];

export const LandlordOverviewPage = () => {
  return (
    <div className="space-y-8">
      {/* ── Time Filters ── */}
      <div className="flex items-center gap-4">
        <div className="flex bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-1 shadow-sm">
          {["Today", "Yesterday", "Week", "Month", "Quarter", "Year"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-1.5 text-[13px] font-semibold rounded-lg transition-colors ${
                tab === "Month"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-xl text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 shadow-sm hover:bg-zinc-50 transition-colors">
          <CalendarIcon size={14} className="text-zinc-400" />
          1—31 December, 2023
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATS.map((s, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-[13px] font-semibold text-zinc-500 mb-2">{s.label}</p>
              <h2 className="text-[28px] font-extrabold tracking-tight text-zinc-900 dark:text-white mb-3">
                {s.value}
              </h2>
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-md ${s.positive ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"}`}>
                  {s.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {s.change}
                </span>
                <span className="text-[11px] font-medium text-zinc-400">vs last month</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center">
              <s.icon size={16} className="text-zinc-400" />
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Listings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-3">
              My listings 
              <Link to="/landlord/post" className="text-[12px] font-medium text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors">
                View all <ArrowUpRight size={12} />
              </Link>
            </h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input type="text" placeholder="Search listings" className="pl-9 pr-4 py-1.5 text-[13px] rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 outline-none w-48 focus:border-zinc-400 transition-colors" />
              </div>
              <div className="flex items-center gap-1.5">
                <button className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <button className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {LISTINGS.map((l) => (
              <div key={l.id} className="group cursor-pointer">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-3">
                  <img src={l.img} alt={l.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-bold text-[13px] text-zinc-900 dark:text-white truncate">{l.title}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${l.status === 'Rented' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-600'}`}>
                    {l.status}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 mb-2 truncate">{l.location}</p>
                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                  {l.specs.map(s => (
                    <span key={s} className="px-2 py-0.5 border border-zinc-200 dark:border-zinc-800 rounded-md text-[10px] font-semibold text-zinc-600 dark:text-zinc-400">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="font-extrabold text-[14px] text-zinc-900 dark:text-white">{l.price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-3">
            Recent messages
            <Link to="/landlord/chat" className="text-[12px] font-medium text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors">
              View all <ArrowUpRight size={12} />
            </Link>
          </h3>
          <div className="flex flex-col gap-1">
            {MESSAGES.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white dark:hover:bg-zinc-900 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 relative">
                  <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-bold text-zinc-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">{m.name}</h4>
                  <p className="text-[12px] text-zinc-500 truncate">{m.text}</p>
                </div>
                <span className="text-[11px] font-medium text-zinc-400 shrink-0">{m.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
