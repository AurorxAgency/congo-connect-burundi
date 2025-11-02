import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-community.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <section className="relative overflow-hidden w-full">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
        
        <div className="container relative mx-auto px-4 py-24">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Bienvenue dans votre
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Communauté Congolaise
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
              Connectez-vous, partagez et grandissez ensemble au Burundi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
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
    </div>
  );
};

export default Landing;
