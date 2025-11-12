import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Image as ImageIcon } from "lucide-react";

const activitySchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères").max(100),
  activity_type: z.string().min(1, "Sélectionnez un type d'activité"),
  contact_info: z.string().min(1, "Le contact est requis"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères").max(1000),
  additional_info: z.string().max(200).optional(),
});

const activityTypes = [
  "Service",
  "Vente",
  "Assistance",
  "Éducation",
  "Santé",
  "Transport",
  "Restauration",
  "Autre",
];

interface CreateActivityProps {
  onActivityCreated: () => void;
}

const CreateActivity = ({ onActivityCreated }: CreateActivityProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<z.infer<typeof activitySchema>>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      name: "",
      activity_type: "",
      contact_info: "",
      description: "",
      additional_info: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof activitySchema>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour créer une activité",
          variant: "destructive",
        });
        return;
      }

      let imageUrl = null;

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('activity-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('activity-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const { error } = await supabase.from("activities").insert({
        user_id: user.id,
        name: values.name,
        activity_type: values.activity_type,
        contact_info: values.contact_info,
        description: values.description,
        additional_info: values.additional_info || null,
        image_url: imageUrl,
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Votre activité a été créée avec succès",
      });

      form.reset();
      setImageFile(null);
      setImagePreview("");
      setIsOpen(false);
      onActivityCreated();
    } catch (error) {
      console.error("Error creating activity:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'activité",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="w-full mb-6">
        <Plus className="h-4 w-4 mr-2" />
        Créer une activité
      </Button>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Créer une nouvelle activité</CardTitle>
        <CardDescription>Partagez votre activité avec la communauté</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'activité</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Réparation de téléphones" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activity_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type d'activité</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activityTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact_info"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact (WhatsApp)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: +243 999 999 999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez votre activité en détail..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additional_info"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Information supplémentaire (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Prix: 50$, Taux: 1$ = 2500 FC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Image de l'activité (optionnel)</FormLabel>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="activity-image"
                />
                <label htmlFor="activity-image">
                  <Button type="button" variant="outline" asChild>
                    <span>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Choisir une image
                    </span>
                  </Button>
                </label>
                {imagePreview && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Publier</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateActivity;
