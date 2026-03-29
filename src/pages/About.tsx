import { MapPin, Users, Target, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  const features = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To create a seamless platform that helps the BMSCE community reconnect with their lost belongings quickly and efficiently.",
      color: "from-[#6200EE] to-[#ff2e97]"
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Built by students, for students. We believe in the power of community to help each other in times of need.",
      color: "from-[#4af8e3] to-[#6200EE]"
    },
    {
      icon: Heart,
      title: "Student Welfare",
      description: "We understand the stress of losing important items on campus. Our goal is to reduce that anxiety and facilitate swift returns.",
      color: "from-[#ff2e97] to-[#ff8a00]"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col font-['Inter']">
      <Navbar />
      
      <main className="flex-1 w-full pt-20">
        {/* Headlights effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-[#16052a]/5 to-transparent pointer-events-none -z-10 blur-3xl"></div>

        {/* Hero Section */}
        <section className="py-24 px-4 relative">
          <div className="container mx-auto text-center max-w-4xl relative z-10">
            <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-[#b89fff] text-xs font-bold tracking-widest uppercase mb-4 border border-white/10 shadow-[0_0_15px_rgba(184,159,255,0.2)]">
              Campus Intelligence
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white font-['Plus_Jakarta_Sans'] tracking-tight mb-6">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4af8e3] to-[#6200EE]">Lost & Found</span>
            </h1>
            <p className="text-xl text-purple-200/70 mb-8 max-w-2xl mx-auto leading-relaxed">
              Your trusted campus companion for reuniting lost items with their rightful owners through an advanced digital concierge.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="container mx-auto px-4 py-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative">
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.color} rounded-3xl blur opacity-25 group-hover:opacity-60 transition duration-1000`}></div>
                <div className="relative h-full bg-[#240e3b] backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-500">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 shadow-lg shadow-black/20 text-white`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 font-['Plus_Jakarta_Sans']">
                    {feature.title}
                  </h3>
                  <p className="text-purple-200/60 leading-relaxed text-sm md:text-base">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* About BMSCE & Contact Split */}
        <section className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Left: About BMSCE */}
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#6200EE]/20 blur-[100px] rounded-full pointer-events-none"></div>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-full bg-[#16052a] border border-white/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-[#ff2e97]" />
                </div>
                <h2 className="text-3xl font-bold text-white font-['Plus_Jakarta_Sans'] tracking-tight">
                  BMS College of Engineering
                </h2>
              </div>
              
              <div className="space-y-6 text-purple-200/70 leading-relaxed">
                <p>
                  BMS College of Engineering (BMSCE) is one of the oldest and most prestigious engineering institutions in India, 
                  established in 1946. Located in the heart of Bangalore on Bull Temple Road, the campus is home to thousands of 
                  students pursuing excellence in engineering and technology.
                </p>
                
                <p>
                  With a sprawling campus and numerous facilities including libraries, laboratories, hostels, and recreational areas, 
                  it's easy for belongings to get misplaced. That's where Lost & Found comes in – bridging the gap between lost items 
                  and their owners through technology and community cooperation.
                </p>

                <div className="bg-[#16052a]/50 p-6 rounded-2xl border border-white/5 mt-8">
                  <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#4af8e3]"></span> Standard Operating Procedure
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="text-[#4af8e3] font-mono mt-1 font-bold">01_</span>
                      <span className="text-sm">Found an anomaly? Inject it into the central database with specifics and coordinates.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#4af8e3] font-mono mt-1 font-bold">02_</span>
                      <span className="text-sm">Missing an item? Query the global registry or initiate a lost protocol alert.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#4af8e3] font-mono mt-1 font-bold">03_</span>
                      <span className="text-sm">Match algorithmic verification. Connect directly and orchestrate a secure handover.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right: Contact */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-[#6200EE] to-[#ff2e97] rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-[#240e3b]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden h-full">
                
                <div className="mb-10 lg:mt-6">
                  <h2 className="text-4xl font-extrabold text-white mb-4 font-['Plus_Jakarta_Sans'] tracking-tight">
                    Establish Link
                  </h2>
                  <p className="text-purple-200/60 text-lg">
                    System administrators are monitoring external communications. Initiate contact.
                  </p>
                </div>

                <div className="space-y-8 mt-12">
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#b89fff]">mail</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-xs">Direct Neural Link (Email)</h4>
                      <p className="text-[#4af8e3] font-mono hover:underline cursor-pointer">lostandfound@bmsce.ac.in</p>
                    </div>
                  </div>

                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#b89fff]">pin_drop</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-xs">Physical Coordinates</h4>
                      <p className="text-purple-200/70 text-sm leading-relaxed">
                        BMS College of Engineering<br />
                        Bull Temple Road, Basavanagudi<br />
                        Bangalore - 560019, Karnataka, India
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#b89fff]">call</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-xs">Voice Channel</h4>
                      <p className="text-white text-lg tracking-wider">+91 80 2662 0011</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
