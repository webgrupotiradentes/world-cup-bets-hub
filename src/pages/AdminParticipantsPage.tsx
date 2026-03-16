import { useState } from "react";
import { useParticipants, useInvalidate } from "@/hooks/use-bolao-data";
import { addParticipant, updateParticipant, deleteParticipant } from "@/lib/supabase-queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminParticipantsPage() {
  const { data: participants = [], isLoading } = useParticipants();
  const [editing, setEditing] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addGroup, setAddGroup] = useState("");
  const { toast } = useToast();
  const invalidate = useInvalidate();

  if (isLoading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Carregando...</div>;
  }

  const handleSave = async (id: string) => {
    try {
      await updateParticipant(id, { name: newName });
      toast({ title: "Participante atualizado!" });
      invalidate("participants", "participants-with-points");
      setEditing(null);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleAdd = async () => {
    if (!addName.trim()) return;
    try {
      await addParticipant(addName, addGroup || undefined);
      toast({ title: "Participante adicionado!", description: addName });
      invalidate("participants", "participants-with-points");
      setAddName("");
      setAddGroup("");
      setShowAdd(false);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteParticipant(id);
      toast({ title: "Participante removido", description: name, variant: "destructive" });
      invalidate("participants", "participants-with-points");
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Participantes
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie os participantes do bolão</p>
        </div>
        <Button className="gradient-primary text-primary-foreground" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4 mr-2" /> Adicionar
        </Button>
      </div>

      {showAdd && (
        <Card className="glass p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Input placeholder="Nome do participante" value={addName} onChange={(e) => setAddName(e.target.value)} className="flex-1 min-w-[200px]" />
            <Input placeholder="Grupo Copa (A, B, C, D)" value={addGroup} onChange={(e) => setAddGroup(e.target.value)} className="w-40" />
            <Button onClick={handleAdd} className="gradient-primary text-primary-foreground">
              <Check className="h-4 w-4 mr-1" /> Confirmar
            </Button>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {participants.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Nenhum participante cadastrado</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {participants.map((p) => (
            <Card key={p.id} className="glass p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">{p.avatar}</div>
                  <div>
                    {editing === p.id ? (
                      <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="h-7 text-sm" />
                    ) : (
                      <p className="font-medium">{p.name}</p>
                    )}
                    <p className="text-xs text-muted-foreground">Grupo Copa: {p.cupGroup || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {editing === p.id ? (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => handleSave(p.id)}>
                        <Check className="h-4 w-4 text-success" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditing(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(p.id); setNewName(p.name); }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id, p.name)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
