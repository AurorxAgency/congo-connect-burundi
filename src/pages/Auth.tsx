import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">(
    searchParams.get("mode") === "signup" ? "signup" : "login"
  );

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Signup form state
  const [nom, setNom] = useState("");
  const [postNom, setPostNom] = useState("");
  const [numeroCarteIdentite, setNumeroCarteIdentite] = useState("");
  const [documentIdentite, setDocumentIdentite] = useState<File | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/feed");
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Connexion réussie !",
        description: "Bienvenue dans la communauté",
      });

      navigate("/feed");
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!documentIdentite) {
        throw new Error("Veuillez télécharger votre document d'identité");
      }

      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nom,
            post_nom: postNom,
            numero_carte_identite: numeroCarteIdentite,
          },
          emailRedirectTo: `${window.location.origin}/feed`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erreur lors de la création du compte");

      const userId = authData.user.id;

      // Upload identity document
      const docExt = documentIdentite.name.split('.').pop();
      const docPath = `${userId}/identity.${docExt}`;
      const { error: docError } = await supabase.storage
        .from('identity-documents')
        .upload(docPath, documentIdentite);

      if (docError) throw docError;

      // Update profile with document URL
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          document_identite_url: docPath,
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      toast({
        title: "Inscription réussie !",
        description: "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
      });

      setMode("login");
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl text-center">
            {mode === "login" ? "Connexion" : "Inscription"}
          </CardTitle>
          <CardDescription className="text-center">
            {mode === "login"
              ? "Connectez-vous à votre compte"
              : "Rejoignez la communauté congolaise"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Se connecter
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Pas encore de compte ?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-primary hover:underline"
                >
                  S'inscrire
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom *</Label>
                  <Input
                    id="nom"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postNom">Post-nom *</Label>
                  <Input
                    id="postNom"
                    value={postNom}
                    onChange={(e) => setPostNom(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signupEmail">Email *</Label>
                <Input
                  id="signupEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroCarteIdentite">Numéro de carte d'identité *</Label>
                <Input
                  id="numeroCarteIdentite"
                  value={numeroCarteIdentite}
                  onChange={(e) => setNumeroCarteIdentite(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signupPassword">Mot de passe *</Label>
                <Input
                  id="signupPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentIdentite">Document d'identité (carte d'électeur, passeport, ou CPGL) *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="documentIdentite"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setDocumentIdentite(e.target.files?.[0] || null)}
                    required
                    className="cursor-pointer"
                  />
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                S'inscrire
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Déjà membre ?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-primary hover:underline"
                >
                  Se connecter
                </button>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
