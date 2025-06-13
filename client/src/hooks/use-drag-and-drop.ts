import { useCallback } from "react";
import type { Member, Family, CompanionshipWithMembers } from "@shared/schema";

interface UseDragAndDropProps {
  members: Member[];
  families: Family[];
  companionships: CompanionshipWithMembers[];
  onCreateCompanionship: (data: { 
    name: string; 
    seniorCompanionId: number; 
    juniorCompanionId?: number; 
  }) => void;
  onAssignFamily: (data: { familyId: number; companionshipId: number | null }) => void;
  isProposeMode: boolean;
}

export function useDragAndDrop({
  members,
  families,
  companionships,
  onCreateCompanionship,
  onAssignFamily,
  isProposeMode,
}: UseDragAndDropProps) {
  
  const handleDrop = useCallback((
    e: React.DragEvent,
    dropZone: string,
    companionshipId?: number
  ) => {
    e.preventDefault();
    
    const dragData = e.dataTransfer.getData("text/plain");
    if (!dragData) return;
    
    try {
      const item = JSON.parse(dragData);
      
      if (dropZone === "companionship" && item.type === "family" && companionshipId) {
        // Assign family to companionship
        onAssignFamily({ familyId: item.data.id, companionshipId });
      } else if (dropZone === "families" && item.type === "family") {
        // Unassign family from companionship
        onAssignFamily({ familyId: item.data.id, companionshipId: null });
      } else if (dropZone === "new-companionship" && item.type === "member") {
        // For now, create a single-member companionship
        // In a real implementation, you'd want to handle dropping 2 members
        const companionshipName = `Companionship with ${item.data.name}`;
        onCreateCompanionship({
          name: companionshipName,
          seniorCompanionId: item.data.id,
        });
      }
    } catch (error) {
      console.error("Failed to parse drag data:", error);
    }
  }, [onCreateCompanionship, onAssignFamily]);

  return { handleDrop };
}
