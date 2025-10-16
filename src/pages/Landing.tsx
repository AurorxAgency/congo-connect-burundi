import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar, MessageCircle, Newspaper } from "lucide-react";
import heroImage from "@/assets/hero-community.jpg";

const Landing = () => {
  const features = [
    {
      icon: Newspaper,
      title: "Fil d'Actualités",
      description: "Partagez et découvrez les nouvelles de la communauté en temps réel.",
    },
    {
      icon: Calendar,
      title: "Événements & Activités",
      description: "Restez informé des événements culturels et opportunités professionnelles.",
    },
    {
      icon: MessageCircle,
      title: "Discussions & Blog",
      description: "Participez aux débats et partagez vos réflexions avec la communauté.",
    },
    {
      icon: Users,
      title: "Réseau Communautaire",
      description: "Connectez-vous avec d'autres membres de la diaspora congolaise.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
        
        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Bienvenue dans votre
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Communauté Congolaise
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Une plateforme moderne et inclusive pour connecter, partager et grandir ensemble au Burundi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg">
                <Link to="/auth?mode=signup">Rejoindre la Communauté</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg">
                <Link to="/auth">Se Connecter</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Une application complète pour rester connecté avec votre communauté
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à rejoindre la communauté ?
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Inscrivez-vous dès maintenant et commencez à vous connecter avec d'autres Congolais vivant au Burundi.
          </p>
          <Button size="lg" variant="secondary" asChild className="text-lg">
            <Link to="/auth?mode=signup">Créer mon compte</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
