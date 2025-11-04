import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Landing = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <section className="relative w-full max-w-2xl mx-4">
        <div className="relative p-8 md:p-12 rounded-3xl bg-card border-4 border-transparent bg-gradient-to-br from-primary via-secondary to-primary bg-clip-border shadow-2xl">
          <div className="absolute inset-[4px] rounded-[calc(1.5rem-4px)] bg-card" />
          
          <div className="relative text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Bienvenue dans la
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
