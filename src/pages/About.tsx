import { MapPin, Users, Target, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  const features = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To create a seamless platform that helps the BMSCE community reconnect with their lost belongings quickly and efficiently."
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Built by students, for students. We believe in the power of community to help each other in times of need."
    },
    {
      icon: Heart,
      title: "Student Welfare",
      description: "We understand the stress of losing important items on campus. Our goal is to reduce that anxiety and facilitate swift returns."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About Lost & Found
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your trusted campus companion for reuniting lost items with their rightful owners
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-12 pb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* About BMSCE Section */}
        <section className="bg-muted/50 py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-foreground mb-4">
                BMS College of Engineering
              </h2>
            </div>
            
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-6">
                BMS College of Engineering (BMSCE) is one of the oldest and most prestigious engineering institutions in India, 
                established in 1946. Located in the heart of Bangalore on Bull Temple Road, the campus is home to thousands of 
                students pursuing excellence in engineering and technology.
              </p>
              
              <p className="mb-6">
                With a sprawling campus and numerous facilities including libraries, laboratories, hostels, and recreational areas, 
                it's easy for belongings to get misplaced. That's where Lost & Found comes in – bridging the gap between lost items 
                and their owners through technology and community cooperation.
              </p>

              <div className="bg-card p-6 rounded-lg mt-8 border">
                <h3 className="text-xl font-semibold text-foreground mb-4">How It Works</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="font-semibold text-primary mr-2">1.</span>
                    <span>Found something? Post it on our platform with details and location</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold text-primary mr-2">2.</span>
                    <span>Lost something? Search our database or post a lost item notice</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold text-primary mr-2">3.</span>
                    <span>Match found! Connect directly and arrange for item return</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Get In Touch
            </h2>
            <p className="text-muted-foreground mb-8">
              Have questions or suggestions? We'd love to hear from you!
            </p>
            <Card>
              <CardContent className="py-8">
                <div className="space-y-4 text-left">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Email</h4>
                    <p className="text-muted-foreground">lostandfound@bmsce.ac.in</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Address</h4>
                    <p className="text-muted-foreground">
                      BMS College of Engineering<br />
                      Bull Temple Road, Basavanagudi<br />
                      Bangalore - 560019, Karnataka, India
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Phone</h4>
                    <p className="text-muted-foreground">+91 80 2662 0011</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
