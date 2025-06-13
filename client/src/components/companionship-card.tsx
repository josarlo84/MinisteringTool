import { useDrop } from "react-dnd";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Handshake, User, Home, X } from "lucide-react";
import type { CompanionshipWithMembers } from "@shared/schema";

interface CompanionshipCardProps {
  companionship: CompanionshipWithMembers;
  onDrop: (e: React.DragEvent, dropZone: string, companionshipId?: number) => void;
}

export default function CompanionshipCard({ companionship, onDrop }: CompanionshipCardProps) {
  const { toast } = useToast();
  const [isOver, setIsOver] = useState(false);

  const deleteCompanionshipMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/companionships/${companionship.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companionships"] });
      queryClient.invalidateQueries({ queryKey: ["/api/families"] });
      toast({ title: "Companionship deleted successfully" });
    },
  });

  const removeFamilyMutation = useMutation({
    mutationFn: (familyId: number) => 
      apiRequest("POST", "/api/assign-family", { familyId, companionshipId: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/families"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companionships"] });
      toast({ title: "Family unassigned successfully" });
    },
  });

  const [{ canDrop }, drop] = useDrop(() => ({
    accept: "family",
    drop: (item: any) => {
      onDrop({} as React.DragEvent, "companionship", companionship.id);
    },
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`bg-blue-50 rounded-lg border-2 transition-all duration-200 ${
        canDrop ? "border-blue-400 bg-blue-100" : "border-blue-200"
      } ${companionship.isProposed ? "ring-2 ring-yellow-300" : ""}`}
    >
      <div className="p-4 border-b border-blue-200 bg-blue-100 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-blue-900 text-sm flex items-center">
            <Handshake className="text-blue-600 mr-2 h-4 w-4" />
            {companionship.name}
            {companionship.isProposed && (
              <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                Proposed
              </span>
            )}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteCompanionshipMutation.mutate()}
            className="text-blue-600 hover:text-blue-800 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Ministering Partners */}
      <div className="p-3 space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-300 rounded-full flex items-center justify-center">
            <User className="text-blue-700 h-3 w-3" />
          </div>
          <span className="text-sm font-medium text-blue-900">
            {companionship.seniorCompanion.name}
          </span>
          <span className="text-xs text-blue-600 bg-blue-200 px-2 py-1 rounded-full">
            Senior
          </span>
        </div>
        {companionship.juniorCompanion && (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-300 rounded-full flex items-center justify-center">
              <User className="text-blue-700 h-3 w-3" />
            </div>
            <span className="text-sm font-medium text-blue-900">
              {companionship.juniorCompanion.name}
            </span>
          </div>
        )}
      </div>

      {/* Assigned Families */}
      <div className="p-3 border-t border-blue-200">
        <p className="text-xs font-medium text-blue-700 mb-2 uppercase tracking-wide">
          Assigned Families
        </p>
        <div className="space-y-2">
          {companionship.assignedFamilies.map(family => (
            <div key={family.id} className="bg-white rounded-md p-2 border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Home className="text-green-600 h-3 w-3" />
                  <span className="text-sm font-medium text-slate-900">
                    {family.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFamilyMutation.mutate(family.id)}
                  className="text-slate-400 hover:text-red-500 p-1"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-slate-500 ml-5">{family.address}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
