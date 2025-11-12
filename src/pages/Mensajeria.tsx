import { useState } from "react";
import { Layout } from "@/components/Layout";
import { MessageSquare } from "lucide-react";
import { useConversations } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { ConversationsList } from "@/components/messaging/ConversationsList";
import { ChatView } from "@/components/messaging/ChatView";
import { MessageInput } from "@/components/messaging/MessageInput";
import { ChatHeader } from "@/components/messaging/ChatHeader";
import { NewConversationDialog } from "@/components/messaging/NewConversationDialog";
import { NewGroupDialog } from "@/components/messaging/NewGroupDialog";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Mensajeria = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearChatDialogOpen, setClearChatDialogOpen] = useState(false);
  const [leaveGroupDialogOpen, setLeaveGroupDialogOpen] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const { conversations, loading: loadingConversations, createConversation, createGroupConversation, deleteConversation, clearMessages, muteConversation, addParticipant, removeParticipant, updateParticipantRole, updateGroupName, leaveGroup } = useConversations();
  const { messages, loading: loadingMessages, typing, onlineUsers, sendMessage, editMessage, deleteMessage, setTypingStatus, refetch: refetchMessages } = useMessages(selectedConversationId);

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);
  const isSelfConversation = selectedConversation?.participante?.id === profile?.id;
  const isOnline = isSelfConversation || (selectedConversation?.participante?.id ? onlineUsers.includes(selectedConversation.participante.id) : false);
  const isAdmin = selectedConversation?.es_grupo && selectedConversation?.my_role === 'administrador';

  const handleBack = () => {
    setSelectedConversationId(null);
  };

  const handleCreateConversation = async (userId: string) => {
    const conversationId = await createConversation(userId);
    if (conversationId) {
      setSelectedConversationId(conversationId);
    }
    return conversationId;
  };

  const handleCreateGroup = async (userIds: string[], groupName: string) => {
    const conversationId = await createGroupConversation(userIds, groupName);
    if (conversationId) {
      setSelectedConversationId(conversationId);
    }
    return conversationId;
  };

  const handleViewProfile = () => {
    if (selectedConversation?.participante?.username) {
      navigate(`/usuario/${selectedConversation.participante.username}`);
    }
  };

  const handleMute = async () => {
    if (!selectedConversationId) return;
    
    const result = await muteConversation(selectedConversationId);
    if (result !== false) {
      toast.success(result ? "Conversación silenciada" : "Conversación activada");
    } else {
      toast.error("Error al silenciar conversación");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedConversationId) return;
    
    const success = await deleteConversation(selectedConversationId);
    if (success) {
      toast.success("Conversación ocultada de 'Todos'");
      setSelectedConversationId(null);
      setDeleteDialogOpen(false);
    } else {
      toast.error("Error al ocultar conversación");
    }
  };

  const handleClearChatConfirm = async () => {
    if (!selectedConversationId) return;
    
    const success = await clearMessages(selectedConversationId);
    if (success) {
      toast.success("Chat limpiado");
      await refetchMessages();
      setClearChatDialogOpen(false);
    } else {
      toast.error("Error al limpiar chat");
    }
  };

  const handleLeaveGroupConfirm = async () => {
    if (!selectedConversationId) return;
    
    const success = await leaveGroup(selectedConversationId);
    if (success) {
      toast.success("Has salido del grupo");
      setSelectedConversationId(null);
      setLeaveGroupDialogOpen(false);
    } else {
      toast.error("Error al salir del grupo");
    }
  };

  // "Mis Grupos" SIEMPRE muestra TODOS los grupos del usuario (sin importar hidden)
  const groupConversations = conversations.filter(c => c.es_grupo);
  
  // "Todos" muestra solo conversaciones no ocultas (individuales y grupales)
  const allNonHiddenConversations = conversations.filter(c => !c.hidden);
  
  // Mostrar según la pestaña seleccionada
  const displayedConversations = showGroups ? groupConversations : allNonHiddenConversations;

  return (
    <Layout title="Mensajes" icon={MessageSquare}>
      <div className="h-[calc(100vh-8rem)] sm:h-[calc(100vh-9rem)] flex border rounded-lg overflow-hidden bg-background">
        {/* Lista de conversaciones */}
        <div
          className={cn(
            "w-full md:w-80 lg:w-96 border-r flex-shrink-0 flex flex-col min-w-0",
            selectedConversationId ? "hidden md:flex" : "flex"
          )}
        >
          <div className="border-b p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className="font-semibold text-base sm:text-lg truncate">Mensajes</h2>
              <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                <NewConversationDialog onCreateConversation={handleCreateConversation} />
                <NewGroupDialog onCreateGroup={handleCreateGroup} />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowGroups(false)}
                className={cn(
                  "flex-1 py-2 px-3 text-sm rounded-md transition-colors",
                  !showGroups 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                Todos
              </button>
              <button
                onClick={() => setShowGroups(true)}
                className={cn(
                  "flex-1 py-2 px-3 text-sm rounded-md transition-colors",
                  showGroups 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                Mis Grupos ({groupConversations.length})
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <ConversationsList
              conversations={displayedConversations}
              loading={loadingConversations}
              selectedId={selectedConversationId}
              onSelect={setSelectedConversationId}
              onDeleteConversation={(id) => {
                setSelectedConversationId(id);
                setDeleteDialogOpen(true);
              }}
            />
          </div>
        </div>

        {/* Vista de chat */}
        <div
          className={cn(
            "flex-1 flex flex-col min-w-0",
            selectedConversationId ? "flex" : "hidden md:flex"
          )}
        >
          {selectedConversationId && selectedConversation ? (
            <>
              <ChatHeader
                name={
                  selectedConversation.es_grupo
                    ? selectedConversation.nombre || "Grupo"
                    : selectedConversation.participante?.name ||
                      selectedConversation.participante?.username ||
                      "Usuario"
                }
                avatar={selectedConversation.participante?.avatar}
                online={isOnline}
                isMuted={selectedConversation.muted}
                isGroup={selectedConversation.es_grupo}
                conversationId={selectedConversationId}
                isAdmin={isAdmin}
                onBack={handleBack}
                onViewProfile={!selectedConversation.es_grupo ? handleViewProfile : undefined}
                onMute={handleMute}
                onClearChat={() => setClearChatDialogOpen(true)}
                onLeaveGroup={selectedConversation.es_grupo ? () => setLeaveGroupDialogOpen(true) : undefined}
                onAddParticipant={addParticipant}
                onRemoveParticipant={removeParticipant}
                onUpdateRole={updateParticipantRole}
                onUpdateGroupName={updateGroupName}
              />
              <ChatView
                messages={messages}
                loading={loadingMessages}
                typing={typing}
                onEditMessage={editMessage}
                onDeleteMessage={deleteMessage}
              />
              <MessageInput
                onSend={sendMessage}
                onTyping={setTypingStatus}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              <div>
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecciona una conversación</h3>
                <p className="text-sm text-muted-foreground">
                  Elige una conversación de la lista para comenzar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Ocultar conversación?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedConversation?.es_grupo ? (
                <>
                  Esta conversación se ocultará de la sección "Todos", pero <strong>siempre permanecerá visible en "Mis Grupos"</strong>. Los mensajes no se eliminarán.
                </>
              ) : (
                <>
                  Esta conversación se ocultará de la sección "Todos". Los mensajes no se eliminarán.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Ocultar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={clearChatDialogOpen} onOpenChange={setClearChatDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Limpiar chat?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto ocultará todos los mensajes de esta conversación solo para ti. Los demás participantes seguirán viendo los mensajes. La conversación permanecerá en tu lista.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearChatConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Limpiar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={leaveGroupDialogOpen} onOpenChange={setLeaveGroupDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Salir del grupo?</AlertDialogTitle>
            <AlertDialogDescription>
              Si sales del grupo, ya no recibirás mensajes ni podrás ver la conversación. Esta acción no se puede deshacer. Solo los administradores pueden volver a agregarte.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveGroupConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Salir del grupo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Mensajeria;
